import {
  AVATAR_SYSTEM_OF,
  avatarIdSchema,
  tutorGenderSchema,
  tutorStatusSchema,
  tutorVoiceSchema,
  type AvatarId,
  type PublicTutor,
  type TutorGender,
  type TutorStatus,
  type TutorVoice,
} from "@glotmate/contracts";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { tutors, userProfiles } from "../../db/schema.js";
import { getAvatarSettings } from "../avatar/settings.js";

/**
 * ÖĞRETMEN ÇÖZÜMLEME — bir kullanıcının derste/rol yapmada göreceği yüz, duyacağı ses
 * ve hocanın adı TEK yerden gelir.
 *
 * Kural: kullanıcının seçtiği öğretmen AKTİFSE o; değilse (seçmedi / gizlendi /
 * silindi) varsayılan öğretmen. Hiç öğretmen kaydı yoksa ESKİ DAVRANIŞ: ad "Emma",
 * global avatar ayarı, global TTS ayarı (`voice: null`) — tablo boşken hiçbir şey
 * değişmez.
 *
 * Liste süreç içi 15 sn önbellekte (app_settings deseni); admin yazınca anında
 * geçersiz kılınır.
 */

/** Öğretmen kaydı yokken hocanın adı (bugüne kadarki tek hoca) */
export const FALLBACK_TUTOR_NAME = "Emma";

export interface TutorRecord {
  id: string;
  name: string;
  avatarId: AvatarId;
  gender: TutorGender;
  voice: TutorVoice;
  status: TutorStatus;
  sortOrder: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Oturumun kullandığı öğretmen — `id: null` = öğretmen kaydı yok (eski davranış) */
export interface ResolvedTutor {
  id: string | null;
  name: string;
  gender: TutorGender;
  avatarId: AvatarId;
  /** null = global TTS ayarı */
  voice: TutorVoice | null;
}

const TTL_MS = 15_000;
let cache: { rows: TutorRecord[]; at: number } | null = null;

export function invalidateTutorCache(): void {
  cache = null;
}

function toRecord(row: typeof tutors.$inferSelect): TutorRecord | null {
  const avatar = avatarIdSchema.safeParse(row.avatarId);
  const gender = tutorGenderSchema.safeParse(row.gender);
  const status = tutorStatusSchema.safeParse(row.status);
  const voice = tutorVoiceSchema.safeParse({ provider: row.voiceProvider, voiceId: row.voiceId, modelId: row.voiceModel });
  if (!avatar.success || AVATAR_SYSTEM_OF[avatar.data] !== "2.5d" || !gender.success || !status.success || !voice.success) {
    // Koddan emekli edilmiş bir rig'e bağlı satır: servis edilmez (sahne boş kalmasın)
    console.warn(`[tutor] "${row.id}" satırı geçersiz (avatar/ses/durum) — atlanıyor`);
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    avatarId: avatar.data,
    gender: gender.data,
    voice: voice.data,
    status: status.data,
    sortOrder: row.sortOrder,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listTutorRecords(): Promise<TutorRecord[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const rows = await db.select().from(tutors).orderBy(asc(tutors.sortOrder), asc(tutors.name));
  const records = rows.map(toRecord).filter((r): r is TutorRecord => r !== null);
  cache = { rows: records, at: Date.now() };
  return records;
}

export function toPublicTutor(t: Pick<TutorRecord, "id" | "name" | "avatarId" | "gender">): PublicTutor {
  return { id: t.id, name: t.name, avatarId: t.avatarId, gender: t.gender };
}

/** Seçilebilir öğretmenler + varsayılan */
export async function listActiveTutors(): Promise<{ tutors: TutorRecord[]; defaultId: string | null }> {
  const all = await listTutorRecords();
  const active = all.filter((t) => t.status === "active");
  return { tutors: active, defaultId: pickDefault(active)?.id ?? null };
}

/** Varsayılan bayraklı aktif öğretmen; bayrak bir şekilde yoksa ilk aktif — kullanıcı asla öğretmensiz kalmaz */
function pickDefault(active: TutorRecord[]): TutorRecord | null {
  return active.find((t) => t.isDefault) ?? active[0] ?? null;
}

function fromRecord(t: TutorRecord): ResolvedTutor {
  return { id: t.id, name: t.name, gender: t.gender, avatarId: t.avatarId, voice: t.voice };
}

async function fallbackTutor(): Promise<ResolvedTutor> {
  const { settings } = await getAvatarSettings();
  return { id: null, name: FALLBACK_TUTOR_NAME, gender: "female", avatarId: settings.activeId, voice: null };
}

/**
 * Seçim kimliğinden öğretmen: seçim aktifse o, değilse varsayılan, o da yoksa eski davranış.
 * `allowHidden`: oturuma PİNLENMİŞ öğretmen ders ortasında gizlenirse ses/ad değişmesin.
 */
export async function resolveTutorById(id: string | null | undefined, opts: { allowHidden?: boolean } = {}): Promise<ResolvedTutor> {
  const all = await listTutorRecords();
  const picked = id ? all.find((t) => t.id === id) : undefined;
  if (picked && (picked.status === "active" || opts.allowHidden)) return fromRecord(picked);
  const def = pickDefault(all.filter((t) => t.status === "active"));
  return def ? fromRecord(def) : fallbackTutor();
}

export async function resolveTutorForUser(userId: string): Promise<ResolvedTutor> {
  const [row] = await db
    .select({ tutorId: userProfiles.tutorId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return resolveTutorById(row?.tutorId ?? null);
}

/** Yalnız aktif öğretmen seçilebilir (onboarding + profil güncelleme) */
export async function isSelectableTutor(id: string): Promise<boolean> {
  const all = await listTutorRecords();
  return all.some((t) => t.id === id && t.status === "active");
}

/** Oturum state'ine pinlenen öğretmen (ad + cinsiyet sabit kalır; ses kimlikten okunur) */
export interface PinnedTutor {
  id: string | null;
  name: string;
  gender: TutorGender;
}

export function pinOf(t: ResolvedTutor): PinnedTutor {
  return { id: t.id, name: t.name, gender: t.gender };
}

/** Pinli öğretmenin güncel kaydı (ses için) — pin yoksa (eski oturum) kullanıcının şimdiki öğretmeni */
export async function resolvePinnedTutor(userId: string, pin: PinnedTutor | undefined): Promise<ResolvedTutor> {
  if (!pin) return resolveTutorForUser(userId);
  if (pin.id === null) return { ...(await fallbackTutor()), name: pin.name, gender: pin.gender };
  const t = await resolveTutorById(pin.id, { allowHidden: true });
  // Pinli kayıt silinmişse varsayılana düşer — ad yine pinden (konuşmanın ortasında ad değişmez)
  return { ...t, name: pin.name, gender: pin.gender };
}

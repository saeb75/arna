import {
  AVATAR_LABELS,
  TUTOR_AVATAR_IDS,
  type AdminTutor,
  type AdminTutorBody,
  type AdminTutorCreateBody,
  type AdminTutorsResponse,
} from "@glotmate/contracts";
import { and, count, eq, ne } from "drizzle-orm";
import { db } from "../../db/client.js";
import { tutors, userProfiles } from "../../db/schema.js";
import { validateTutorVoice } from "../tts/index.js";
import { invalidateTutorCache } from "../tutor/registry.js";

/**
 * ÖĞRETMEN YÖNETİMİ (admin). Kurallar:
 * - Tam olarak bir varsayılan öğretmen: `isDefault: true` yazmak diğerlerinden kaldırır;
 *   varsayılanın bayrağı doğrudan kaldırılamaz (önce başka birini varsayılan yap).
 * - Varsayılan gizlenemez — seçimi gizlenen kullanıcılar ona düşüyor.
 * - İlk öğretmen kendiliğinden varsayılan olur.
 * - Ses kaydedilmeden önce denetlenir (sağlayıcının anahtarı var mı, model tanınıyor mu).
 * - Silme YOK: öğretmen gizlenir (kullanıcı seçimleri korunur, yeniden açılınca geri döner).
 */
export class TutorAdminError extends Error {
  constructor(
    public code: "not_found" | "exists" | "default_required" | "default_hidden" | "voice_invalid",
    message: string,
  ) {
    super(message);
  }
}

function toAdmin(row: typeof tutors.$inferSelect, userCount: number): AdminTutor {
  return {
    id: row.id,
    name: row.name,
    avatarId: row.avatarId as AdminTutor["avatarId"],
    gender: row.gender as AdminTutor["gender"],
    voice: { provider: row.voiceProvider as AdminTutor["voice"]["provider"], voiceId: row.voiceId, modelId: row.voiceModel },
    status: row.status as AdminTutor["status"],
    sortOrder: row.sortOrder,
    isDefault: row.isDefault,
    userCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAdminTutors(): Promise<AdminTutorsResponse> {
  const [rows, counts] = await Promise.all([
    db.select().from(tutors).orderBy(tutors.sortOrder, tutors.name),
    db.select({ tutorId: userProfiles.tutorId, n: count() }).from(userProfiles).groupBy(userProfiles.tutorId),
  ]);
  const byTutor = new Map(counts.map((c) => [c.tutorId, Number(c.n)]));
  return {
    tutors: rows.map((r) => toAdmin(r, byTutor.get(r.id) ?? 0)),
    avatars: TUTOR_AVATAR_IDS.map((id) => ({ id, label: AVATAR_LABELS[id] })),
  };
}

function checkVoice(body: AdminTutorBody): void {
  try {
    validateTutorVoice(body.voice);
  } catch (err) {
    throw new TutorAdminError("voice_invalid", err instanceof Error ? err.message : String(err));
  }
}

function columns(body: AdminTutorBody) {
  return {
    name: body.name,
    avatarId: body.avatarId,
    gender: body.gender,
    voiceProvider: body.voice.provider,
    voiceId: body.voice.voiceId,
    voiceModel: body.voice.modelId,
    status: body.status,
    sortOrder: body.sortOrder,
  };
}

export async function createTutor(body: AdminTutorCreateBody, updatedBy: string | null): Promise<AdminTutorsResponse> {
  checkVoice(body);
  await db.transaction(async (tx) => {
    const [exists] = await tx.select({ id: tutors.id }).from(tutors).where(eq(tutors.id, body.id)).limit(1);
    if (exists) throw new TutorAdminError("exists", `"${body.id}" zaten var`);
    const [{ n }] = (await tx.select({ n: count() }).from(tutors)) as [{ n: number }];
    const isDefault = body.isDefault || Number(n) === 0;
    if (isDefault && body.status !== "active") throw new TutorAdminError("default_hidden", "Varsayılan öğretmen gizlenemez");
    if (isDefault) await tx.update(tutors).set({ isDefault: false }).where(eq(tutors.isDefault, true));
    await tx.insert(tutors).values({ id: body.id, ...columns(body), isDefault, updatedBy });
  });
  invalidateTutorCache();
  return listAdminTutors();
}

export async function updateTutor(id: string, body: AdminTutorBody, updatedBy: string | null): Promise<AdminTutorsResponse> {
  checkVoice(body);
  await db.transaction(async (tx) => {
    const [row] = await tx.select().from(tutors).where(eq(tutors.id, id)).limit(1);
    if (!row) throw new TutorAdminError("not_found", `"${id}" yok`);
    if (row.isDefault && !body.isDefault) {
      throw new TutorAdminError("default_required", "Varsayılanı kaldırmak için önce başka bir öğretmeni varsayılan yap");
    }
    if (body.isDefault && body.status !== "active") throw new TutorAdminError("default_hidden", "Varsayılan öğretmen gizlenemez");
    if (body.isDefault && !row.isDefault) {
      await tx.update(tutors).set({ isDefault: false }).where(and(eq(tutors.isDefault, true), ne(tutors.id, id)));
    }
    await tx
      .update(tutors)
      .set({ ...columns(body), isDefault: body.isDefault, updatedBy, updatedAt: new Date() })
      .where(eq(tutors.id, id));
  });
  invalidateTutorCache();
  return listAdminTutors();
}

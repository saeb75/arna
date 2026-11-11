import {
  TTS_PROVIDERS,
  adminTutorBodySchema,
  tutorIdSchema,
  tutorNameSchema,
  type AdminTtsSettingsResponse,
  type AdminTutor,
  type AdminTutorBody,
  type AvatarId,
  type TtsProvider,
  type TutorGender,
  type TutorStatus,
} from "@glotmate/contracts";

/**
 * Öğretmen editörünün saf çekirdeği — React'sız; `scripts/test-tutor-draft.ts`.
 *
 * Form durumu `AdminTutorCreateBody`nin GEVŞEK hâlidir: yazarken alanlar boş olabilir,
 * sıra numarası input metni olarak tutulur. Sunucuya giden şey `validateTutorForm` →
 * `adminTutorBodySchema` çıktısıdır. Hata metinleri İNGİLİZCE ve alan bazlıdır
 * (contracts'taki Türkçe regex mesajları ekrana taşınmaz — roleplayDraft ile aynı ilke).
 *
 * İstemci kuralları sunucununkilerin aynısıdır (`apps/backend/src/modules/admin/tutors.ts`):
 * varsayılan gizlenemez, varsayılanın bayrağı doğrudan kaldırılamaz, ilk öğretmen
 * kendiliğinden varsayılandır, ses yalnız anahtarı olan sağlayıcıdan ve izinli modelle.
 */

export interface TutorForm {
  id: string;
  /** Kimlik addan türetiliyor mu — yalnız oluştururken, operatör kimliği elle yazana kadar */
  idAuto: boolean;
  name: string;
  avatarId: AvatarId | "";
  gender: TutorGender;
  provider: TtsProvider;
  voiceId: string;
  modelId: string;
  status: TutorStatus;
  /** Input metni — sayıya validasyonda çevrilir */
  sortOrder: string;
  isDefault: boolean;
}

export type TutorField = "id" | "name" | "avatarId" | "gender" | "voice" | "status" | "sortOrder" | "isDefault";
export type TutorIssues = Partial<Record<TutorField, string[]>>;

export type TutorEditorMode = "create" | "edit";

export interface TutorValidationContext {
  mode: TutorEditorMode;
  tts: AdminTtsSettingsResponse;
  /** Mevcut öğretmenler (kimlik çakışması + varsayılan kuralları) */
  tutors: AdminTutor[];
  /** Bağlanabilir 2.5D rig'ler (sunucudan) */
  avatarIds: AvatarId[];
  /** Düzenlenen öğretmenin kimliği; oluştururken null */
  originalId: string | null;
}

/** Şemayla aynı sınırlar — sayaçlar buradan okur */
export const TUTOR_LIMITS = { idMax: 32, nameMin: 2, nameMax: 24, voiceMax: 200, sortMax: 9999 } as const;

export const DEFAULT_REQUIRED_MESSAGE = "To remove the default flag, make another tutor the default first";
export const DEFAULT_HIDDEN_MESSAGE = "The default tutor can't be hidden";

/** "Lena Marie" → "lena-marie": küçük harf, rakam, tire; harfle başlar, ≤32 */
export function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^[^a-z]+/, "")
    .slice(0, TUTOR_LIMITS.idMax)
    .replace(/-+$/, "");
}

/** Önce global aktif sağlayıcı (anahtarı varsa), yoksa anahtarı olan ilk sağlayıcı */
export function firstConfiguredProvider(tts: AdminTtsSettingsResponse): TtsProvider | null {
  if (tts.configured[tts.settings.provider]) return tts.settings.provider;
  return TTS_PROVIDERS.find((p) => tts.configured[p]) ?? null;
}

/**
 * Sağlayıcı seçilince ses/model başlangıcı: global ayardaki ses → .env varsayılanı →
 * katalogdaki ilk ses; model global ayardaki (izinliyse) ya da listenin ilki.
 */
export function voiceDefaults(tts: AdminTtsSettingsResponse, provider: TtsProvider): { voiceId: string; modelId: string } {
  const cfg = tts.settings[provider];
  const models = tts.models[provider];
  return {
    voiceId: cfg.voiceId ?? tts.defaultVoiceId[provider] ?? tts.voices[provider]?.[0]?.id ?? "",
    modelId: models.includes(cfg.modelId) ? cfg.modelId : models[0],
  };
}

export function emptyTutorForm(tutors: AdminTutor[], avatarIds: AvatarId[], tts: AdminTtsSettingsResponse): TutorForm {
  const provider = firstConfiguredProvider(tts) ?? tts.settings.provider;
  const maxSort = tutors.reduce((m, t) => Math.max(m, t.sortOrder), -10);
  return {
    id: "",
    idAuto: true,
    name: "",
    avatarId: avatarIds[0] ?? "",
    gender: "female",
    provider,
    ...voiceDefaults(tts, provider),
    status: "active",
    sortOrder: String(Math.min(TUTOR_LIMITS.sortMax, maxSort + 10)),
    isDefault: tutors.length === 0,
  };
}

export function formFromTutor(t: AdminTutor): TutorForm {
  return {
    id: t.id,
    idAuto: false,
    name: t.name,
    avatarId: t.avatarId,
    gender: t.gender,
    provider: t.voice.provider,
    voiceId: t.voice.voiceId,
    modelId: t.voice.modelId,
    status: t.status,
    sortOrder: String(t.sortOrder),
    isDefault: t.isDefault,
  };
}

/** Ad değişimi; kimlik henüz elle yazılmadıysa addan türer */
export function withName(form: TutorForm, name: string, mode: TutorEditorMode): TutorForm {
  const next = { ...form, name };
  return mode === "create" && form.idAuto ? { ...next, id: slugFromName(name) } : next;
}

export function withProvider(form: TutorForm, tts: AdminTtsSettingsResponse, provider: TtsProvider): TutorForm {
  if (provider === form.provider) return form;
  return { ...form, provider, ...voiceDefaults(tts, provider) };
}

/** Kirli denetimi için kanonik anahtar — `idAuto` sunum durumudur, dahil değil */
export function formKey(form: TutorForm): string {
  const { idAuto: _idAuto, ...rest } = form;
  void _idAuto;
  return JSON.stringify(rest);
}

/** Oluştururken hiç öğretmen yoksa sunucu yenisini zaten varsayılan yapar */
export function effectiveDefault(form: TutorForm, ctx: Pick<TutorValidationContext, "mode" | "tutors">): boolean {
  return form.isDefault || (ctx.mode === "create" && ctx.tutors.length === 0);
}

/** Ad şemadan geçiyor mu — ses örneği adı söylediği için örnek bunu ister */
export function isValidTutorName(name: string): boolean {
  return tutorNameSchema.safeParse(name).success;
}

function nameIssue(name: string): string | null {
  if (tutorNameSchema.safeParse(name).success) return null;
  const t = name.trim();
  if (t.length < TUTOR_LIMITS.nameMin) return `At least ${TUTOR_LIMITS.nameMin} characters.`;
  if (t.length > TUTOR_LIMITS.nameMax) return `At most ${TUTOR_LIMITS.nameMax} characters.`;
  return "Latin letters only (spaces, hyphens and apostrophes allowed), starting with a letter.";
}

function voiceIssue(form: TutorForm, tts: AdminTtsSettingsResponse): string | null {
  if (!tts.configured[form.provider]) return "This provider has no API key in .env — pick another one.";
  const voiceId = form.voiceId.trim();
  if (!voiceId) return "Enter a voice.";
  if (voiceId.length > TUTOR_LIMITS.voiceMax) return `The voice id is at most ${TUTOR_LIMITS.voiceMax} characters.`;
  if (!tts.models[form.provider].includes(form.modelId)) return "Pick a model from the list.";
  return null;
}

/**
 * İki kapının istemci yarısı. Hata yoksa `body` sunucuya gidecek şemadan geçmiş gövdedir
 * (kimlik ayrı: oluşturmada `{ ...body, id: form.id }`, düzenlemede adreste).
 */
export function validateTutorForm(
  form: TutorForm,
  ctx: TutorValidationContext,
): { body: AdminTutorBody | null; issues: TutorIssues } {
  const issues: TutorIssues = {};
  const add = (field: TutorField, message: string) => {
    (issues[field] ??= []).push(message);
  };

  if (ctx.mode === "create") {
    if (!tutorIdSchema.safeParse(form.id).success) {
      add("id", "2–32 characters: lowercase letters, digits and hyphens, starting with a letter.");
    } else if (ctx.tutors.some((t) => t.id === form.id)) {
      add("id", "A tutor with this id already exists.");
    }
  }

  const n = nameIssue(form.name);
  if (n) add("name", n);

  if (!form.avatarId) add("avatarId", "Pick an avatar rig.");
  else if (!ctx.avatarIds.includes(form.avatarId)) add("avatarId", "This rig can no longer be bound to a tutor — pick another one.");

  const v = voiceIssue(form, ctx.tts);
  if (v) add("voice", v);

  const sort = form.sortOrder.trim();
  if (!/^\d+$/.test(sort) || Number(sort) > TUTOR_LIMITS.sortMax) add("sortOrder", `A whole number from 0 to ${TUTOR_LIMITS.sortMax}.`);

  const isDefault = effectiveDefault(form, ctx);
  if (isDefault && form.status === "hidden") add("status", `${DEFAULT_HIDDEN_MESSAGE}.`);
  const original = ctx.originalId ? ctx.tutors.find((t) => t.id === ctx.originalId) : undefined;
  if (ctx.mode === "edit" && original?.isDefault && !form.isDefault) add("isDefault", `${DEFAULT_REQUIRED_MESSAGE}.`);

  if (Object.keys(issues).length > 0) return { body: null, issues };

  const parsed = adminTutorBodySchema.safeParse({
    name: form.name.trim(),
    avatarId: form.avatarId,
    gender: form.gender,
    voice: { provider: form.provider, voiceId: form.voiceId.trim(), modelId: form.modelId },
    status: form.status,
    sortOrder: Number(sort),
    isDefault,
  });
  if (parsed.success) return { body: parsed.data, issues };

  // Yukarıdaki kurallar şemayı kapsıyor; buraya düşen bir şema farkıdır — alanına genel mesaj
  const FIELDS: TutorField[] = ["name", "avatarId", "gender", "voice", "status", "sortOrder", "isDefault"];
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? "");
    add(FIELDS.includes(key as TutorField) ? (key as TutorField) : "name", "Invalid value.");
  }
  return { body: null, issues };
}

const FIELD_KEYS: Record<TutorField, (keyof TutorForm)[]> = {
  id: ["id"],
  name: ["name"],
  avatarId: ["avatarId"],
  gender: ["gender"],
  voice: ["provider", "voiceId", "modelId"],
  status: ["status"],
  sortOrder: ["sortOrder"],
  isDefault: ["isDefault"],
};

/** Çapraz kurallar (varsayılan/gizli, ses) her an görünür — operatör sebebini hemen görmeli */
const ALWAYS_SHOWN: TutorField[] = ["voice", "status", "isDefault"];

/**
 * Ekranda gösterilecek hatalar: boş formda "zorunlu" hataları bağırmasın diye alan
 * ancak değiştirildiyse ya da kaydet denendiyse gösterilir.
 */
export function visibleIssues(form: TutorForm, baseline: string, issues: TutorIssues, attempted: boolean): TutorIssues {
  if (attempted) return issues;
  const initial = JSON.parse(baseline) as Partial<TutorForm>;
  const out: TutorIssues = {};
  for (const [field, messages] of Object.entries(issues) as [TutorField, string[]][]) {
    const changed = FIELD_KEYS[field].some((k) => form[k] !== initial[k]);
    if (changed || ALWAYS_SHOWN.includes(field)) out[field] = messages;
  }
  return out;
}

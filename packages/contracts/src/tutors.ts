// ÖĞRETMENLER — kullanıcının seçtiği hoca karakteri (yüz + ses + ad).
//
// Kayıt DB'de yaşar (`tutors` tablosu, admin panel yönetir); her satır KODDAKİ bir
// 2.5D rig'e (avatars.ts → AVATAR_SYSTEM_OF = "2.5d") bağlanır — görseller ve rig
// ölçüleri kod/OTA ile gelir, panel yalnız "bu rig + bu ses + bu ad" eşlemesini kurar.
// Yeni bir yüz = sprite hattı + rig kaydı (kod), yeni bir öğretmen = panel.
//
// Ses ÖĞRETMENİN kimliğidir: sağlayıcı + ses + model öğretmen satırında durur, global
// TTS ayarı (`app_settings.tts`) yalnız öğretmen kaydı hiç yokken kullanılır. Global
// sağlayıcı değişse bile öğretmenin sesi değişmez.
//
// Ad ders prompt'larında ve rol yapmada kullanılır (rol yapmada öğretmen persona'yı
// KENDİ adıyla oynar — yüz/ses/ad hep uyumlu). `gender` ana dilde dilbilgisel cinsiyet
// için prompt'a girer (ör. İspanyolca "estoy cansada"); arayüzde gösterilmez.
import { z } from "zod";
import { TTS_PROVIDERS } from "./admin.js";
import { AVATAR_IDS, AVATAR_SYSTEM_OF, type AvatarId } from "./avatars.js";
import { ttsResponseSchema } from "./sessionApi.js";

/** Kalıcı slug — kullanıcı profili buna bağlanır, değiştirilmez */
export const tutorIdSchema = z.string().regex(/^[a-z][a-z0-9-]{1,31}$/, "küçük harf, rakam, tire (2–32)");
export type TutorId = z.infer<typeof tutorIdSchema>;

export const TUTOR_GENDERS = ["female", "male"] as const;
export const tutorGenderSchema = z.enum(TUTOR_GENDERS);
export type TutorGender = z.infer<typeof tutorGenderSchema>;

/** active = seçilebilir; hidden = seçtirilmez ve onu seçmiş kullanıcılar varsayılan öğretmene düşer */
export const TUTOR_STATUSES = ["active", "hidden"] as const;
export const tutorStatusSchema = z.enum(TUTOR_STATUSES);
export type TutorStatus = z.infer<typeof tutorStatusSchema>;

/** Öğretmen yalnız 2.5D rig'e bağlanabilir (mobil native çizer; 3D WebView yolu ayrı) */
export const TUTOR_AVATAR_IDS = AVATAR_IDS.filter((id) => AVATAR_SYSTEM_OF[id] === "2.5d") as AvatarId[];
export const tutorAvatarIdSchema = z
  .enum(AVATAR_IDS)
  .refine((id) => AVATAR_SYSTEM_OF[id] === "2.5d", { message: "öğretmen yalnız 2.5D avatara bağlanır" });

/**
 * Öğretmenin adı İngilizce bir ilk addır: prompt'ta "You are Lena" ve rol yapma
 * açılışında "Hi! I'm Lena" olarak geçer, TTS İngilizce okur. Harf + boşluk/tire.
 */
export const tutorNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^[A-Za-z][A-Za-z' -]*$/, "Latin harfleriyle bir ad");

export const tutorVoiceSchema = z.object({
  provider: z.enum(TTS_PROVIDERS),
  voiceId: z.string().trim().min(1).max(200),
  modelId: z.string().trim().min(1).max(100),
});
export type TutorVoice = z.infer<typeof tutorVoiceSchema>;

// ---------------------------------------------------------------------------
// Kullanıcı istemcileri (mobil) — `GET /v1/tutors`, `/v1/me` içindeki `tutor`
// ---------------------------------------------------------------------------

/** İstemcinin gördüğü öğretmen: ses ayrıntısı (sağlayıcı/ses kimliği) istemciye GİTMEZ */
export const publicTutorSchema = z.object({
  id: tutorIdSchema,
  name: z.string(),
  avatarId: z.enum(AVATAR_IDS),
  gender: tutorGenderSchema,
});
export type PublicTutor = z.infer<typeof publicTutorSchema>;

export const tutorsResponseSchema = z.object({
  /** Seçilebilir öğretmenler, panel sırasıyla */
  tutors: z.array(publicTutorSchema),
  /** Seçim yapmamış kullanıcının öğretmeni (onboarding'de ön seçili) */
  defaultId: tutorIdSchema.nullable(),
});
export type TutorsResponse = z.infer<typeof tutorsResponseSchema>;

/** `POST /v1/tutors/:id/sample` — kısa İngilizce tanıtım cümlesi, öğretmenin sesiyle (TTS cevabının aynısı) */
export const tutorSampleResponseSchema = ttsResponseSchema;

// ---------------------------------------------------------------------------
// Admin — `GET/POST /v1/admin/tutors`, `PUT /v1/admin/tutors/:id`, `POST .../preview`
// ---------------------------------------------------------------------------

export const adminTutorBodySchema = z.object({
  name: tutorNameSchema,
  avatarId: tutorAvatarIdSchema,
  gender: tutorGenderSchema,
  voice: tutorVoiceSchema,
  status: tutorStatusSchema,
  sortOrder: z.number().int().min(0).max(9999),
  /** Tam olarak bir öğretmen varsayılandır; true yazmak diğerlerinden kaldırır. Varsayılan gizlenemez. */
  isDefault: z.boolean(),
});
export type AdminTutorBody = z.infer<typeof adminTutorBodySchema>;

export const adminTutorCreateBodySchema = adminTutorBodySchema.extend({ id: tutorIdSchema });
export type AdminTutorCreateBody = z.infer<typeof adminTutorCreateBodySchema>;

export const adminTutorSchema = adminTutorCreateBodySchema.extend({
  avatarId: z.enum(AVATAR_IDS),
  /** Bu öğretmeni seçmiş kullanıcı sayısı (gizlenirse bunlar varsayılana düşer) */
  userCount: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminTutor = z.infer<typeof adminTutorSchema>;

export const adminTutorsResponseSchema = z.object({
  tutors: z.array(adminTutorSchema),
  /** Bağlanabilir 2.5D rig'ler (koddan) */
  avatars: z.array(z.object({ id: z.enum(AVATAR_IDS), label: z.string() })),
});
export type AdminTutorsResponse = z.infer<typeof adminTutorsResponseSchema>;

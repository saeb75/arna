import { z } from "zod";
import { entitlementSchema } from "./billing.js";
import { cefrLevelSchema } from "./levels.js";
import { interestSchema, trackSchema, tutorLanguageSchema } from "./profile.js";
import { publicTutorSchema, tutorIdSchema } from "./tutors.js";

// ============================================================================
// /v1/me — öğrencinin kendi hesabı (profil, abonelik, kota, istatistik)
// ============================================================================

/** IANA saat dilimi ("Europe/Istanbul"). Günlük kota ve seri bu güne göre sayılır. */
export const timezoneSchema = z.string().trim().min(1).max(64);

export const DAILY_GOAL_MINUTES = [5, 10, 15] as const;
export const dailyGoalSchema = z.union([z.literal(5), z.literal(10), z.literal(15)]);

export const meProfileSchema = z.object({
  displayName: z.string(),
  nativeLanguage: z.string(),
  cefrLevel: cefrLevelSchema,
  track: trackSchema,
  tutorLanguage: tutorLanguageSchema,
  dailyGoalMinutes: z.number().int(),
  interests: z.array(z.string()),
  occupation: z.string().nullable(),
  timezone: z.string(),
  /** Kullanıcının SEÇTİĞİ öğretmen (null = seçmedi → varsayılan). Gizlenmişse de burada kalır; çözümlenmiş hali `MeResponse.tutor` */
  tutorId: z.string().nullable(),
});
export type MeProfile = z.infer<typeof meProfileSchema>;

export const meResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().nullable(),
  /** Supabase anonim oturumu — "İlerlemeni kaydet" kartı buna bakar */
  isAnonymous: z.boolean(),
  /** null = onboarding bitmemiş (istemci kapısı /onboarding'e yollar) */
  profile: meProfileSchema.nullable(),
  entitlement: entitlementSchema,
  /**
   * Derslerde/rol yapmada görünecek öğretmen — sunucu çözümler (seçim gizlenmişse
   * ya da yoksa varsayılan). null = hiç öğretmen kaydı yok (eski davranış: global avatar).
   */
  tutor: publicTutorSchema.nullable(),
});
export type MeResponse = z.infer<typeof meResponseSchema>;

/**
 * Profil güncelleme. İlerleme katalog kimliğine bağlı olduğu için seviye/track
 * değişimi hiçbir ilerlemeyi etkilemez (eski regenerate ucunun tersine).
 */
export const profilePatchSchema = z
  .object({
    displayName: z.string().trim().min(1).max(60),
    cefrLevel: cefrLevelSchema,
    track: trackSchema,
    tutorLanguage: tutorLanguageSchema,
    /** Öğretmen seçimi — yalnız aktif öğretmen kabul edilir (sunucu doğrular) */
    tutorId: tutorIdSchema,
    dailyGoalMinutes: dailyGoalSchema,
    interests: z.array(interestSchema).min(1).max(8),
    occupation: z.string().trim().max(120).nullable(),
    timezone: timezoneSchema,
  })
  .partial()
  .refine((p) => Object.keys(p).length > 0, { message: "en az bir alan gerekli" });
export type ProfilePatch = z.infer<typeof profilePatchSchema>;

export const meStatsDaySchema = z.object({
  /** YYYY-MM-DD, kullanıcının gününde */
  date: z.string(),
  minutes: z.number().min(0),
  active: z.boolean(),
});

export const meStatsSchema = z.object({
  /** Bugün (ya da dün) dahil kesintisiz aktif gün sayısı */
  streak: z.number().int().min(0),
  bestStreak: z.number().int().min(0),
  todayMinutes: z.number().min(0),
  dailyGoalMinutes: z.number().int(),
  /** Eskiden yeniye, bugün SON eleman */
  last7Days: z.array(meStatsDaySchema).length(7),
  lessonsCompleted: z.number().int().min(0),
  roleplaysCompleted: z.number().int().min(0),
  totalMinutes: z.number().min(0),
});
export type MeStats = z.infer<typeof meStatsSchema>;

export const entitlementRefreshResponseSchema = z.object({
  entitlement: entitlementSchema,
});

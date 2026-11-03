import { z } from "zod";

// ============================================================================
// ABONELİK + GÜNLÜK ÜCRETSİZ KOTA
//
// Kullanıcıyla kilitlenen model (12 Eki 2026): ücretsiz kullanıcı günde 1 ders
// + 1 rol yapma AÇAR; Pro sınırsız. Zorlama SUNUCUDADIR (oturum açan iki uçta),
// istemci yalnız göstergeyi çizer ve 402'de paywall açar.
//
// Sayılan şey OTURUM değil, gün içinde açılan FARKLI ders/senaryo kimliğidir:
// devam (resume) aynı oturumu sürdürür, "Baştan başla" aynı dersi yeniden açar —
// ikisi de yeni hak yakmaz. Aksi hâlde aktarım hatası ya da yeniden başlatma
// öğrenciyi kendi açtığı dersten kilitlerdi.
// ============================================================================

export const QUOTA_KINDS = ["lesson", "roleplay"] as const;
export const quotaKindSchema = z.enum(QUOTA_KINDS);
export type QuotaKind = z.infer<typeof quotaKindSchema>;

/** Pro'nun kaynağı: mağaza aboneliği (RevenueCat) ya da admin'in tanıdığı ücretsiz Pro */
export const ENTITLEMENT_SOURCES = ["revenuecat", "admin"] as const;

export const entitlementSchema = z.object({
  isPro: z.boolean(),
  source: z.enum(ENTITLEMENT_SOURCES).nullable(),
  productId: z.string().nullable(),
  /** ISO; null = süresiz (ömür boyu ya da süresiz admin tanıması) */
  expiresAt: z.string().nullable(),
});
export type Entitlement = z.infer<typeof entitlementSchema>;

export const quotaUsageSchema = z.object({
  /** Bugün açılan farklı ders/senaryo sayısı */
  used: z.number().int().min(0),
  /** null = sınırsız (Pro) */
  limit: z.number().int().min(0).nullable(),
});
export type QuotaUsage = z.infer<typeof quotaUsageSchema>;

export const quotaSchema = z.object({
  lesson: quotaUsageSchema,
  roleplay: quotaUsageSchema,
  /** Kotanın sıfırlanacağı an (kullanıcının saat diliminde gece yarısı), ISO */
  resetsAt: z.string(),
});
export type Quota = z.infer<typeof quotaSchema>;

/** 402 gövdesi — istemci `kind`'a göre paywall kaynağını seçer */
export const quotaExceededSchema = z.object({
  error: z.literal("quota_exceeded"),
  kind: quotaKindSchema,
  quota: quotaSchema,
});
export type QuotaExceeded = z.infer<typeof quotaExceededSchema>;

export type QuotaDecision =
  | { allowed: true; reason: "pro" | "repeat" | "within_limit" }
  | { allowed: false; reason: "exceeded" };

/**
 * SAF KARAR — sunucu oturum açmadan önce çağırır; doğruluk tablosu
 * `apps/backend/scripts/test-quota.ts`'te, LLM'siz.
 *
 * @param startedToday bugün (kullanıcının gününde) açılmış FARKLI anahtarlar
 * @param key          açılmak istenen ders/senaryo kimliği
 */
export function decideQuota(input: {
  isPro: boolean;
  limit: number;
  startedToday: readonly string[];
  key: string;
}): QuotaDecision {
  if (input.isPro) return { allowed: true, reason: "pro" };
  if (input.startedToday.includes(input.key)) return { allowed: true, reason: "repeat" };
  if (new Set(input.startedToday).size < input.limit) return { allowed: true, reason: "within_limit" };
  return { allowed: false, reason: "exceeded" };
}

/** Kalan hak — gösterge için; sınırsızsa null */
export function quotaRemaining(usage: QuotaUsage): number | null {
  return usage.limit === null ? null : Math.max(0, usage.limit - usage.used);
}

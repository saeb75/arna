import { z } from "zod";

// ============================================================================
// ABONELİK (Pro hakkı)
//
// 5 Kas 2026, kullanıcı kararı: günlük ücretsiz kota (1 ders + 1 rol yapma) TAMAMEN
// kaldırıldı — şimdilik her şey ücretsiz, hiçbir uç 402 dönmez, uygulamada paywall'a
// giden giriş yok. Abonelik kurgusu ileride ayrıca tasarlanacak; Pro hakkı altyapısı
// (RevenueCat doğrulaması, admin tanıması) onun için yerinde duruyor.
// ============================================================================

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

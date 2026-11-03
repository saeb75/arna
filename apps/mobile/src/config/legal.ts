/**
 * Uygulamanın bağlandığı yasal sayfalar — App Store her abonelik paywall'ında
 * ikisini de ister. Alan adı henüz kesinleşmediyse EAS env ile ezilir.
 */
export const LEGAL = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? "https://glotmate.com/terms",
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? "https://glotmate.com/privacy",
} as const;

/** Destek adresi */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? "support@glotmate.com";

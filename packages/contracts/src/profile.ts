import { z } from "zod";

/**
 * PROFİL ALANLARI — YAPRAK MODÜL (levels.ts ile aynı sebep): `me.ts` de bu
 * şemaları okuyor; index'te kalsalardı `export *` döngüsünde ilklenme anında
 * tanımsız olurlardı. `index.ts` yeniden dışa aktarır, dış API değişmez.
 */

/**
 * KONUŞMA BAĞLAMI — "öğrenme yolu" DEĞİL. Yalnızca rol yapma sahnesinin dekorunu
 * belirler; anlatım, alıştırmalar ve cevaplar track'ten bağımsızdır (çekirdekte).
 * Bu yüzden onboarding kopyası "İngilizceyi en çok nerede kullanacaksın?" der,
 * "IELTS hazırlık programı" vaadi VERMEZ — gerçek sınav içeriği ileride ayrı
 * eksen (learningGoal) olarak açılabilir.
 * Eşleme (eski → yeni): conversation→everyday, business→work.
 */
export const TRACKS = ["everyday", "work", "travel", "academic", "exam"] as const;
export const trackSchema = z.enum(TRACKS);
export type Track = z.infer<typeof trackSchema>;

/** Öğretim dili: native → Emma açıklamaları öğrencinin dilinde yapar. */
export const TUTOR_LANGUAGES = ["native", "english"] as const;
export const tutorLanguageSchema = z.enum(TUTOR_LANGUAGES);
export type TutorLanguage = z.infer<typeof tutorLanguageSchema>;

export const INTEREST_AREAS = [
  "technology",
  "business",
  "travel",
  "movies_tv",
  "music",
  "sports",
  "gaming",
  "food",
  "science",
  "health",
  "finance",
  "art_design",
  "fashion",
  "education",
  "news_politics",
  "nature",
] as const;
export const interestSchema = z.enum(INTEREST_AREAS);
export type Interest = z.infer<typeof interestSchema>;

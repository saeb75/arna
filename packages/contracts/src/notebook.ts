/**
 * DEFTER — öğrencinin hataları ve kaydettiği kelimeler (14 Kas 2026).
 *
 * Hatalar `answer_reviews`'tan gelir: derste/rol yapmada serbest söylenen her İngilizce
 * söz arka planda incelenir (`reviewAnswer`), `error` ve `unnatural` hükümleri burada
 * listelenir. Başka dilde söylenen söz HATA DEĞİLDİR — listeye girmez.
 * Kelimeler: hocanın İngilizce sözünde dokunulan kelime + ana dildeki karşılığı.
 */
import { z } from "zod";
import { textRunSchema } from "./lessonLayers.js";

export const mistakeKindSchema = z.enum(["error", "unnatural"]);
export type MistakeKind = z.infer<typeof mistakeKindSchema>;

export const mistakeItemSchema = z.object({
  id: z.string(),
  kind: mistakeKindSchema,
  /** Öğrencinin sözü — duyduğumuz/yazdığı hâliyle */
  text: z.string(),
  /** Söylenmesi gereken İngilizce cümle */
  corrected: z.string(),
  /** Açıklama, dil etiketli */
  runs: z.array(textRunSchema),
  origin: z.object({
    kind: z.enum(["lesson", "roleplay"]),
    /** Ders adı (kanonik İngilizce) ya da senaryo adı */
    title: z.string(),
    /** Katalog ders kimliği / roleplay slug'ı — yoksa bağlantı gösterilmez */
    ref: z.string().nullable(),
  }),
  createdAt: z.string(),
});
export type MistakeItem = z.infer<typeof mistakeItemSchema>;

export const mistakesResponseSchema = z.object({
  items: z.array(mistakeItemSchema),
  /** Sonraki sayfanın imleci (`before`); null = bitti */
  next: z.string().nullable(),
  counts: z.object({ error: z.number().int(), unnatural: z.number().int() }),
});
export type MistakesResponse = z.infer<typeof mistakesResponseSchema>;

/** Dokunulan kelime: yalnız harf, kesme ve tire — cümle değil */
export const lookupWordSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[A-Za-z][A-Za-z'’-]*$/);

export const wordLookupResponseSchema = z.object({
  word: z.string(),
  translation: z.string(),
  /**
   * Kelimenin geçtiği cümlenin çevirisi — tek kelime bağlamsız yanıltabilir
   * ("book a room" → "kitap"); cümle anlamı yerine oturtur. Cümle yollanmadıysa null.
   */
  sentenceTranslation: z.string().nullable().optional(),
  /** Kullanıcı bu kelimeyi daha önce kaydetmiş mi */
  saved: z.boolean(),
});
export type WordLookupResponse = z.infer<typeof wordLookupResponseSchema>;

export const savedWordSchema = z.object({
  id: z.string(),
  word: z.string(),
  translation: z.string(),
  sentence: z.string().nullable(),
  createdAt: z.string(),
});
export type SavedWord = z.infer<typeof savedWordSchema>;

export const savedWordsResponseSchema = z.object({ items: z.array(savedWordSchema) });

/** Kelimenin anahtarı: küçük harf, düz kesme — "Don’t" ve "don't" aynı kelime */
export function wordKey(word: string): string {
  return word.trim().toLowerCase().replace(/’/g, "'");
}

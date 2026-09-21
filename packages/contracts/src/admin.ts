import { z } from "zod";
import { cefrLevelSchema, lessonKindSchema } from "./levels.js";

/**
 * ADMİN PANELİ SÖZLEŞMELERİ — `GET /v1/admin/*` uçları.
 *
 * Panel yalnızca bu şemalardan geçen veriyi ekrana taşır (mobil kuralı: elle
 * response tipi yazılmaz). Katalog verisi kanonik İngilizcedir ve olduğu gibi
 * gösterilir — admin arayüzü kullanıcıya değil operatöre bakar.
 *
 * Yaprak modüllerden okur (`levels.ts`); `index.ts`'ten import etmez — index bu
 * dosyayı yeniden dışa aktardığı için aksi ilklenme döngüsü olurdu.
 */

/** Üç katmanın da paylaştığı durum akışı: generating → ready → published → retired (failed yan dal). */
export const LAYER_STATUSES = ["generating", "ready", "failed", "published", "retired"] as const;
export const layerStatusSchema = z.enum(LAYER_STATUSES);
export type LayerStatus = z.infer<typeof layerStatusSchema>;

/** Çekirdek veya sahne seti satırının panelde görünen özeti. */
export const adminLayerSchema = z.object({
  id: z.string().uuid(),
  status: layerStatusSchema,
  updatedAt: z.string(),
});
export type AdminLayer = z.infer<typeof adminLayerSchema>;

/**
 * Dil paketi özeti. `stale`: paketin `sourceHash`i, çekirdek+sahne+başlığın güncel
 * parmak iziyle tutmuyor — ders ilk açılışta yeniden üretilecek; panel bunu
 * turuncu işaretle gösterir ki operatör ısıtma script'ini koşabilsin.
 */
export const adminLocaleSchema = z.object({
  language: z.string().min(2),
  status: layerStatusSchema,
  stale: z.boolean(),
  updatedAt: z.string(),
});
export type AdminLocale = z.infer<typeof adminLocaleSchema>;

/** Katalog satırı + üç katmanın güncel (format/promptVersion/specHash tutan) durumu. */
export const adminLessonSchema = z.object({
  id: z.string(),
  level: cefrLevelSchema,
  unitIndex: z.number().int().min(1),
  unitTitle: z.string(),
  position: z.number().int().min(1),
  kind: lessonKindSchema,
  title: z.string(),
  focus: z.string(),
  targetPhrases: z.array(z.string()),
  /** null = bu katalog sürümü için hiç üretilmemiş */
  core: adminLayerSchema.nullable(),
  sceneSet: adminLayerSchema.nullable(),
  locales: z.array(adminLocaleSchema),
});
export type AdminLesson = z.infer<typeof adminLessonSchema>;

export const adminLessonsResponseSchema = z.object({
  lessons: z.array(adminLessonSchema),
  /** Sunucunun matrisi derlediği an — panel "son güncelleme" olarak gösterir */
  generatedAt: z.string(),
});
export type AdminLessonsResponse = z.infer<typeof adminLessonsResponseSchema>;

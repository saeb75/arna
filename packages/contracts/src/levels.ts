import { z } from "zod";

/**
 * CEFR seviyeleri — YAPRAK MODÜL, hiçbir şey import etmez (zod hariç).
 *
 * `index.ts`'te duruyordu; `roleplay.ts` de buna ihtiyaç duyunca DÖNGÜ oluştu:
 * index roleplay'i yeniden dışa aktarıyor, roleplay index'ten okuyor, ve modül
 * ilklenme anında `cefrLevelSchema` henüz tanımlı değil. Yaprak modüle taşınınca
 * her iki taraf da güvenle okuyabiliyor. `index.ts` bunu yeniden dışa aktardığı
 * için dışarıya bakan API değişmiyor.
 */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const cefrLevelSchema = z.enum(CEFR_LEVELS);
export type CefrLevel = z.infer<typeof cefrLevelSchema>;

/**
 * Ders tipi. Sabit müfredat kataloğunun ritmi buna dayanır: `grammar` yapı
 * öğretir, `phrases` işlevsel kalıp seti verir, `practice` yalnızca konuşturur.
 * Katalog lint'i 4'ten fazla ardışık `grammar` dersine izin vermez.
 *
 * `admin.ts` de okuduğu için CEFR ile aynı sebeple yaprak modülde.
 */
export const LESSON_KINDS = ["phrases", "grammar", "practice"] as const;
export const lessonKindSchema = z.enum(LESSON_KINDS);
export type LessonKind = z.infer<typeof lessonKindSchema>;

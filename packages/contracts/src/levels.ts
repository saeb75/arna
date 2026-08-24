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

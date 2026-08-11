import { createHash } from "node:crypto";
import type { CefrLevel } from "@arna/contracts";
import { A1 } from "./a1.js";
import { A2 } from "./a2.js";
import type { CurriculumLesson, CurriculumLevel } from "./types.js";

export * from "./types.js";

/**
 * SABİT MÜFREDAT — tek doğruluk kaynağı burasıdır, DB türetilmiş projeksiyondur.
 * Henüz yazılmamış seviyeler burada yoktur; lint ve seed eksik seviyeyi hata
 * saymaz, yalnızca raporlar (B1–C2 sonraki turda aynı kalıpla eklenecek).
 */
export const CURRICULUM: Partial<Record<CefrLevel, CurriculumLevel>> = {
  A1,
  A2,
};

export const AUTHORED_LEVELS = Object.keys(CURRICULUM) as CefrLevel[];

/** "She Works at Night" → "she-works-at-night" */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Katalog satırının kalıcı kimliği: açıkça yazılmışsa o, değilse başlıktan türetilir. */
export function lessonId(level: CefrLevel, lesson: CurriculumLesson): string {
  return lesson.id ?? `${level.toLowerCase()}-${slugify(lesson.title)}`;
}

export function unitId(level: CefrLevel, unitIndex: number): string {
  return `${level.toLowerCase()}-u${String(unitIndex).padStart(2, "0")}`;
}

/**
 * ÜRETİMİ ETKİLEYEN alanların parmak izi. İçerik önbellek anahtarının parçasıdır:
 * bir dersin `focus`'u düzeltilince hash değişir, anahtar değişir ve o ders bir
 * sonraki açılışta kendiliğinden yeniden üretilir. Elle bump edilen bir `revision`
 * sayacı unutulurdu; türetilmiş hash unutulamaz.
 *
 * `position`, `unitIndex` ve `title` KASTEN dışarıda: sıra değişikliği ya da
 * başlık düzeltmesi üretilmiş içeriği geçersiz kılmamalı.
 */
export function specHash(level: CefrLevel, lesson: CurriculumLesson): string {
  const canonical = JSON.stringify([
    level,
    lesson.kind,
    lesson.focus,
    lesson.themeHint,
    [...lesson.targetPhrases],
  ]);
  return createHash("sha256").update(canonical).digest("hex").slice(0, 12);
}

/**
 * Saf süzme/özet yardımcılarının doğruluk tablosu — LLM'siz, DB'siz, anlık.
 *   npx tsx scripts/test-lesson-filters.ts
 */
import assert from "node:assert/strict";
import type { AdminLesson, LayerStatus } from "@glotmate/contracts";
import { applyFilters, groupByUnit, knownLanguages, missingLocales, summarize } from "../src/lib/lessonFilters";

const layer = (status: LayerStatus) => ({
  id: "00000000-0000-0000-0000-000000000000",
  status,
  updatedAt: "2026-09-21T00:00:00.000Z",
});
const locale = (language: string, stale = false) => ({ language, status: "ready" as const, stale, updatedAt: "2026-09-21T00:00:00.000Z" });

const L = (p: Partial<AdminLesson> & Pick<AdminLesson, "id" | "position" | "unitIndex">): AdminLesson => ({
  level: "A1",
  unitTitle: `Unit ${p.unitIndex}`,
  kind: "grammar",
  title: p.id,
  focus: "focus",
  targetPhrases: [],
  core: null,
  sceneSet: null,
  locales: [],
  ...p,
});

const lessons: AdminLesson[] = [
  L({ id: "a1-one", position: 1, unitIndex: 1, core: layer("published"), sceneSet: layer("published"), locales: [locale("tr"), locale("es", true)] }),
  L({ id: "a1-two", position: 2, unitIndex: 1, kind: "phrases", core: layer("ready"), sceneSet: null }),
  L({ id: "a1-three", position: 3, unitIndex: 2, title: "Ordering coffee" }),
  L({ id: "b1-one", position: 1, unitIndex: 1, level: "B1", core: layer("published"), sceneSet: layer("published"), locales: [locale("tr")] }),
];

const base = { level: "A1" as const, kind: "all" as const, layer: "all" as const, q: "" };

assert.deepEqual(applyFilters(lessons, base).map((l) => l.id), ["a1-one", "a1-two", "a1-three"], "seviye süzer");
assert.deepEqual(applyFilters(lessons, { ...base, kind: "phrases" }).map((l) => l.id), ["a1-two"], "tür süzer");
assert.deepEqual(applyFilters(lessons, { ...base, layer: "no_core" }).map((l) => l.id), ["a1-three"], "çekirdeği yok");
assert.deepEqual(applyFilters(lessons, { ...base, layer: "unpublished" }).map((l) => l.id), ["a1-two", "a1-three"], "yayınlanmamış: ready ya da eksik sahne");
assert.deepEqual(applyFilters(lessons, { ...base, layer: "no_locale" }).map((l) => l.id), ["a1-two", "a1-three"], "dil paketi yok");
assert.deepEqual(applyFilters(lessons, { ...base, layer: "stale" }).map((l) => l.id), ["a1-one"], "bayat paket");
assert.deepEqual(applyFilters(lessons, { ...base, q: "  COFFEE " }).map((l) => l.id), ["a1-three"], "arama: büyük/küçük ve boşluk duyarsız");
assert.deepEqual(applyFilters(lessons, { ...base, q: "Unit 2" }).map((l) => l.id), ["a1-three"], "arama ünite başlığına da bakar");

const s = summarize(applyFilters(lessons, base));
assert.deepEqual(s, { lessons: 3, publishedCores: 1, publishedScenes: 1, locales: 2, staleLocales: 1, languages: 2 }, "özet");

const groups = groupByUnit([lessons[2]!, lessons[1]!, lessons[0]!]); // karışık sıra verilir
assert.deepEqual(groups.map((g) => [g.unitIndex, g.lessons.map((l) => l.id)]), [[1, ["a1-one", "a1-two"]], [2, ["a1-three"]]], "pozisyona göre sıralar, üniteye gruplar");

// Toplu ısıtma hedefleri: yalnız canlı (core+scene) dersler; eksik → force:false, bayat → force:true
const targets = missingLocales(lessons, ["tr", "es", "de"]);
assert.deepEqual(
  targets,
  [
    { lessonId: "a1-one", language: "es", force: true },
    { lessonId: "a1-one", language: "de", force: false },
    { lessonId: "b1-one", language: "es", force: false },
    { lessonId: "b1-one", language: "de", force: false },
  ],
  "ısıtma hedefleri: a1-two (sahne yok) ve a1-three (çekirdek yok) atlanır",
);
assert.deepEqual(knownLanguages(lessons), ["es", "tr"], "bilinen diller sıralı ve tekil");

console.log("✅ lessonFilters: tüm vakalar geçti");

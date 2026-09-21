import type { AdminLesson } from "@glotmate/contracts";
import type { LessonFilters } from "@/stores/useLessonsStore";

/**
 * Saf süzme/özetleme — store ve React'tan bağımsız; `scripts/test-lesson-filters.ts`
 * ile LLM'siz, DB'siz sınanır. 395 satır istemcide süzülür; sunucuya filtre gitmez.
 */
export function applyFilters(lessons: AdminLesson[], f: LessonFilters): AdminLesson[] {
  const q = f.q.trim().toLowerCase();
  return lessons.filter((l) => {
    if (l.level !== f.level) return false;
    if (f.kind !== "all" && l.kind !== f.kind) return false;
    if (!matchesLayer(l, f.layer)) return false;
    if (q && !`${l.id} ${l.title} ${l.focus} ${l.unitTitle}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function matchesLayer(l: AdminLesson, layer: LessonFilters["layer"]): boolean {
  switch (layer) {
    case "all":
      return true;
    case "no_core":
      return l.core === null;
    case "unpublished":
      return l.core?.status !== "published" || l.sceneSet?.status !== "published";
    case "no_locale":
      return l.locales.length === 0;
    case "stale":
      return l.locales.some((x) => x.stale);
  }
}

export interface LevelSummary {
  lessons: number;
  publishedCores: number;
  publishedScenes: number;
  locales: number;
  staleLocales: number;
  languages: number;
}

/** Bir seviyenin (ya da verilen alt kümenin) katman özeti — stat kartları bunu okur */
export function summarize(lessons: AdminLesson[]): LevelSummary {
  const languages = new Set<string>();
  let publishedCores = 0, publishedScenes = 0, locales = 0, staleLocales = 0;
  for (const l of lessons) {
    if (l.core?.status === "published") publishedCores++;
    if (l.sceneSet?.status === "published") publishedScenes++;
    for (const x of l.locales) {
      locales++;
      languages.add(x.language);
      if (x.stale) staleLocales++;
    }
  }
  return { lessons: lessons.length, publishedCores, publishedScenes, locales, staleLocales, languages: languages.size };
}

/** Ünite sırasına göre gruplar; tablo ünite ayraç satırlarını bundan kurar */
export function groupByUnit(lessons: AdminLesson[]): { unitIndex: number; unitTitle: string; lessons: AdminLesson[] }[] {
  const groups: { unitIndex: number; unitTitle: string; lessons: AdminLesson[] }[] = [];
  for (const l of [...lessons].sort((a, b) => a.position - b.position)) {
    const last = groups[groups.length - 1];
    if (last && last.unitIndex === l.unitIndex) last.lessons.push(l);
    else groups.push({ unitIndex: l.unitIndex, unitTitle: l.unitTitle, lessons: [l] });
  }
  return groups;
}

import {
  CORE_FORMAT,
  L10N_FORMAT,
  SCENE_FORMAT,
  type AdminLayer,
  type AdminLesson,
  type AdminLessonsResponse,
  type AdminLocale,
  type CefrLevel,
  type LayerStatus,
  type LessonKind,
} from "@glotmate/contracts";
import { and, asc, desc, eq, inArray, like, not } from "drizzle-orm";
import { db } from "../../db/client.js";
import { catalogLessons, catalogUnits, lessonCores, lessonLocales, lessonSceneSets } from "../../db/schema.js";
import { localeSourceHash } from "../lesson/layers.js";
import { LESSON_CORE_VERSION } from "../llm/prompts/lesson-core.v1.js";
import { LESSON_LOCALE_VERSION } from "../llm/prompts/lesson-locale.v1.js";
import { LESSON_SCENES_VERSION } from "../llm/prompts/lesson-scenes.v1.js";

/**
 * DERS MATRİSİ — katalog × (çekirdek · sahne seti · dil paketleri).
 *
 * "Güncel" katman = `layers.ts`'in servis anında arayacağı satır: format +
 * promptVersion (+ çekirdekte katalog `specHash`i) tutan satır. Eski format veya
 * prompt sürümündeki satırlar burada GÖRÜNMEZ — panel operatöre "bugün servis
 * edilebilir ne var"ı gösterir, arkeoloji yapmaz. Aynı anahtarda birden fazla
 * satır varsa (yeniden üretim) en son güncellenen alınır.
 *
 * Dört sorgu, JS'te birleştirme; ders başına sorgu (N+1) yok — 395 ders için
 * tek istek ~4 round-trip.
 */
export async function getAdminLessonMatrix(): Promise<AdminLessonsResponse> {
  // Test fixture'ları (`zz-`) paylaşımlı katalogda yaşıyor ve her koşuda kendini
  // aktifleştiriyor — koruma tüketici tarafında (curriculum/queries.ts ile aynı).
  const rows = await db
    .select({
      id: catalogLessons.id,
      level: catalogLessons.level,
      unitIndex: catalogLessons.unitIndex,
      unitTitle: catalogUnits.title,
      position: catalogLessons.position,
      kind: catalogLessons.kind,
      title: catalogLessons.title,
      focus: catalogLessons.focus,
      targetPhrases: catalogLessons.targetPhrases,
      specHash: catalogLessons.specHash,
    })
    .from(catalogLessons)
    .innerJoin(catalogUnits, eq(catalogUnits.id, catalogLessons.unitId))
    .where(and(eq(catalogLessons.status, "active"), not(like(catalogLessons.id, "zz-%"))))
    .orderBy(asc(catalogLessons.level), asc(catalogLessons.position));

  const lessonIds = rows.map((r) => r.id);
  if (lessonIds.length === 0) return { lessons: [], generatedAt: new Date().toISOString() };

  const coreRows = await db
    .select()
    .from(lessonCores)
    .where(
      and(
        inArray(lessonCores.catalogLessonId, lessonIds),
        eq(lessonCores.coreFormat, CORE_FORMAT),
        eq(lessonCores.promptVersion, LESSON_CORE_VERSION),
      ),
    )
    .orderBy(desc(lessonCores.updatedAt));

  // Ders → güncel çekirdek (specHash da tutmalı; ilk görülen = en yeni)
  const coreByLesson = new Map<string, (typeof coreRows)[number]>();
  const specByLesson = new Map(rows.map((r) => [r.id, r.specHash]));
  for (const c of coreRows) {
    if (c.specHash !== specByLesson.get(c.catalogLessonId)) continue;
    if (!coreByLesson.has(c.catalogLessonId)) coreByLesson.set(c.catalogLessonId, c);
  }

  const coreIds = [...coreByLesson.values()].map((c) => c.id);
  const sceneRows = coreIds.length
    ? await db
        .select()
        .from(lessonSceneSets)
        .where(
          and(
            inArray(lessonSceneSets.coreId, coreIds),
            eq(lessonSceneSets.sceneFormat, SCENE_FORMAT),
            eq(lessonSceneSets.promptVersion, LESSON_SCENES_VERSION),
          ),
        )
        .orderBy(desc(lessonSceneSets.updatedAt))
    : [];
  const sceneByCore = new Map<string, (typeof sceneRows)[number]>();
  for (const s of sceneRows) if (!sceneByCore.has(s.coreId)) sceneByCore.set(s.coreId, s);

  const sceneIds = [...sceneByCore.values()].map((s) => s.id);
  const localeRows = sceneIds.length
    ? await db
        .select({
          coreId: lessonLocales.coreId,
          sceneSetId: lessonLocales.sceneSetId,
          language: lessonLocales.language,
          status: lessonLocales.status,
          sourceHash: lessonLocales.sourceHash,
          updatedAt: lessonLocales.updatedAt,
        })
        .from(lessonLocales)
        .where(
          and(
            inArray(lessonLocales.sceneSetId, sceneIds),
            eq(lessonLocales.l10nFormat, L10N_FORMAT),
            eq(lessonLocales.promptVersion, LESSON_LOCALE_VERSION),
          ),
        )
        .orderBy(desc(lessonLocales.updatedAt))
    : [];
  const localesByScene = new Map<string, typeof localeRows>();
  for (const l of localeRows) {
    const list = localesByScene.get(l.sceneSetId) ?? [];
    list.push(l);
    localesByScene.set(l.sceneSetId, list);
  }

  const toLayer = (row: { id: string; status: string; updatedAt: Date } | undefined): AdminLayer | null =>
    row ? { id: row.id, status: row.status as LayerStatus, updatedAt: row.updatedAt.toISOString() } : null;

  const lessons: AdminLesson[] = rows.map((r) => {
    const core = coreByLesson.get(r.id);
    const scene = core ? sceneByCore.get(core.id) : undefined;

    // Bayatlık: paketin anlattığı içerik (başlık+çekirdek+sahne) değişmişse
    // sourceHash tutmaz. Girdi layers.ts `resolveLesson` ile BİREBİR aynı olmalı:
    // sahne seti `{ sceneFormat, scenes }` zarfıyla hash'lenir, ham `scenes` değil —
    // aksi hâlde 790 paketin hepsi "bayat" görünüyordu (ilk koşuda yaşandı).
    const currentHash =
      core && scene ? localeSourceHash(r.title, core.core, { sceneFormat: SCENE_FORMAT, scenes: scene.scenes }) : null;
    const seenLangs = new Set<string>();
    const locales: AdminLocale[] = [];
    for (const l of scene ? (localesByScene.get(scene.id) ?? []) : []) {
      // Dil başına en yeni satır (liste updatedAt desc sıralı)
      if (seenLangs.has(l.language)) continue;
      seenLangs.add(l.language);
      locales.push({
        language: l.language,
        status: l.status as LayerStatus,
        stale: currentHash !== null && l.sourceHash !== currentHash,
        updatedAt: l.updatedAt.toISOString(),
      });
    }
    locales.sort((a, b) => a.language.localeCompare(b.language));

    return {
      id: r.id,
      level: r.level as CefrLevel,
      unitIndex: r.unitIndex,
      unitTitle: r.unitTitle,
      position: r.position,
      kind: r.kind as LessonKind,
      title: r.title,
      focus: r.focus,
      targetPhrases: r.targetPhrases,
      core: toLayer(core),
      sceneSet: toLayer(scene),
      locales,
    };
  });

  return { lessons, generatedAt: new Date().toISOString() };
}

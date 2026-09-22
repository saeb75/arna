import {
  CORE_FORMAT,
  L10N_FORMAT,
  SCENE_FORMAT,
  type AdminLayer,
  type AdminLesson,
  type AdminLessonDetail,
  type AdminLessonsResponse,
  type AdminLocale,
  type CefrLevel,
  type LayerStatus,
  type LessonCore,
  type LessonKind,
  type LintReport,
  type SceneVariant,
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
 * tek istek ~4 round-trip. Detay ucu aynı çözümlemeyi TEK ders için kullanır.
 */

export class AdminError extends Error {
  constructor(public code: "not_found") {
    super(code);
  }
}

// Test fixture'ları (`zz-`) paylaşımlı katalogda yaşıyor ve her koşuda kendini
// aktifleştiriyor — koruma tüketici tarafında (curriculum/queries.ts ile aynı).
const catalogSelect = {
  id: catalogLessons.id,
  level: catalogLessons.level,
  unitIndex: catalogLessons.unitIndex,
  unitTitle: catalogUnits.title,
  position: catalogLessons.position,
  kind: catalogLessons.kind,
  title: catalogLessons.title,
  focus: catalogLessons.focus,
  themeHint: catalogLessons.themeHint,
  targetPhrases: catalogLessons.targetPhrases,
  specHash: catalogLessons.specHash,
};
type CatalogRow = {
  [K in keyof typeof catalogSelect]: (typeof catalogSelect)[K]["_"]["data"];
};

type CoreRow = typeof lessonCores.$inferSelect;
type SceneRow = typeof lessonSceneSets.$inferSelect;
type LocaleRow = typeof lessonLocales.$inferSelect;

interface CurrentLayers {
  coreByLesson: Map<string, CoreRow>;
  sceneByCore: Map<string, SceneRow>;
  /** sceneSetId → dil başına EN YENİ satır (updatedAt desc) */
  localesByScene: Map<string, LocaleRow[]>;
}

/** Verilen katalog satırları için güncel katmanları üç sorguda toplar. */
async function loadCurrentLayers(rows: CatalogRow[]): Promise<CurrentLayers> {
  const empty: CurrentLayers = { coreByLesson: new Map(), sceneByCore: new Map(), localesByScene: new Map() };
  if (rows.length === 0) return empty;

  const coreRows = await db
    .select()
    .from(lessonCores)
    .where(
      and(
        inArray(lessonCores.catalogLessonId, rows.map((r) => r.id)),
        eq(lessonCores.coreFormat, CORE_FORMAT),
        eq(lessonCores.promptVersion, LESSON_CORE_VERSION),
      ),
    )
    .orderBy(desc(lessonCores.updatedAt));

  // Ders → güncel çekirdek (specHash da tutmalı; ilk görülen = en yeni)
  const specByLesson = new Map(rows.map((r) => [r.id, r.specHash]));
  for (const c of coreRows) {
    if (c.specHash !== specByLesson.get(c.catalogLessonId)) continue;
    if (!empty.coreByLesson.has(c.catalogLessonId)) empty.coreByLesson.set(c.catalogLessonId, c);
  }

  const coreIds = [...empty.coreByLesson.values()].map((c) => c.id);
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
  for (const s of sceneRows) if (!empty.sceneByCore.has(s.coreId)) empty.sceneByCore.set(s.coreId, s);

  const sceneIds = [...empty.sceneByCore.values()].map((s) => s.id);
  const localeRows = sceneIds.length
    ? await db
        .select()
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
  const seen = new Set<string>();
  for (const l of localeRows) {
    const k = `${l.sceneSetId}:${l.language}`;
    if (seen.has(k)) continue; // dil başına en yeni satır
    seen.add(k);
    const list = empty.localesByScene.get(l.sceneSetId) ?? [];
    list.push(l);
    empty.localesByScene.set(l.sceneSetId, list);
  }
  return empty;
}

const toLayer = (row: { id: string; status: string; updatedAt: Date } | undefined): AdminLayer | null =>
  row ? { id: row.id, status: row.status as LayerStatus, updatedAt: row.updatedAt.toISOString() } : null;

/**
 * Bayatlık: paketin anlattığı içerik (başlık+çekirdek+sahne) değişmişse sourceHash
 * tutmaz. Girdi layers.ts `resolveLesson` ile BİREBİR aynı olmalı: sahne seti
 * `{ sceneFormat, scenes }` zarfıyla hash'lenir, ham `scenes` değil — aksi hâlde
 * 790 paketin hepsi "bayat" görünüyordu (ilk koşuda yaşandı).
 */
export function currentLocaleHash(title: string, core: CoreRow | undefined, scene: SceneRow | undefined): string | null {
  return core && scene ? localeSourceHash(title, core.core, { sceneFormat: SCENE_FORMAT, scenes: scene.scenes }) : null;
}

function toLesson(r: CatalogRow, layers: CurrentLayers): { lesson: AdminLesson; core?: CoreRow; scene?: SceneRow; locales: LocaleRow[]; hash: string | null } {
  const core = layers.coreByLesson.get(r.id);
  const scene = core ? layers.sceneByCore.get(core.id) : undefined;
  const hash = currentLocaleHash(r.title, core, scene);
  const locales = (scene ? (layers.localesByScene.get(scene.id) ?? []) : [])
    .slice()
    .sort((a, b) => a.language.localeCompare(b.language));

  const summary: AdminLocale[] = locales.map((l) => ({
    language: l.language,
    status: l.status as LayerStatus,
    stale: hash !== null && l.sourceHash !== hash,
    updatedAt: l.updatedAt.toISOString(),
  }));

  return {
    lesson: {
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
      locales: summary,
    },
    core,
    scene,
    locales,
    hash,
  };
}

const activeNotFixture = and(eq(catalogLessons.status, "active"), not(like(catalogLessons.id, "zz-%")));

export async function getAdminLessonMatrix(): Promise<AdminLessonsResponse> {
  const rows = await db
    .select(catalogSelect)
    .from(catalogLessons)
    .innerJoin(catalogUnits, eq(catalogUnits.id, catalogLessons.unitId))
    .where(activeNotFixture)
    .orderBy(asc(catalogLessons.level), asc(catalogLessons.position));

  const layers = await loadCurrentLayers(rows);
  return { lessons: rows.map((r) => toLesson(r, layers).lesson), generatedAt: new Date().toISOString() };
}

/** Tek dersin tam detayı: katman içerikleri + lint raporları. Fixture (`zz-`) dersleri de açılır — testler için. */
export async function getAdminLessonDetail(catalogLessonId: string): Promise<AdminLessonDetail> {
  const [row] = await db
    .select(catalogSelect)
    .from(catalogLessons)
    .innerJoin(catalogUnits, eq(catalogUnits.id, catalogLessons.unitId))
    .where(and(eq(catalogLessons.id, catalogLessonId), eq(catalogLessons.status, "active")))
    .limit(1);
  if (!row) throw new AdminError("not_found");

  const layers = await loadCurrentLayers([row]);
  const { lesson, core, scene, locales, hash } = toLesson(row, layers);
  const report = (r: unknown): LintReport | null => (r ? (r as LintReport) : null);

  return {
    lesson,
    catalog: { themeHint: row.themeHint, specHash: row.specHash },
    core: core
      ? { ...toLayer(core)!, model: core.model, core: (core.core as LessonCore | null) ?? null, report: report(core.validationReport) }
      : null,
    sceneSet: scene
      ? {
          ...toLayer(scene)!,
          model: scene.model,
          scenes: (scene.scenes as Record<string, SceneVariant> | null) ?? null,
          report: report(scene.validationReport),
        }
      : null,
    locales: locales.map((l) => ({
      id: l.id,
      language: l.language,
      status: l.status as LayerStatus,
      stale: hash !== null && l.sourceHash !== hash,
      updatedAt: l.updatedAt.toISOString(),
      model: l.model,
      report: report(l.validationReport),
    })),
  };
}

/** Servis katmanının ihtiyaç duyduğu ham satırlar (içerik + hash) — detayın yanında tek çağrı */
export async function getCurrentLayerRows(catalogLessonId: string) {
  const [row] = await db
    .select(catalogSelect)
    .from(catalogLessons)
    .innerJoin(catalogUnits, eq(catalogUnits.id, catalogLessons.unitId))
    .where(and(eq(catalogLessons.id, catalogLessonId), eq(catalogLessons.status, "active")))
    .limit(1);
  if (!row) throw new AdminError("not_found");
  const layers = await loadCurrentLayers([row]);
  const core = layers.coreByLesson.get(row.id);
  const scene = core ? layers.sceneByCore.get(core.id) : undefined;
  return { catalog: row, core, scene, hash: currentLocaleHash(row.title, core, scene) };
}

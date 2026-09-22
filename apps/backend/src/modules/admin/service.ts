import {
  CORE_FORMAT,
  SCENE_FORMAT,
  lessonCoreSchema,
  type AdminLessonDetail,
  type LessonCore,
  type SceneSet,
} from "@glotmate/contracts";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../../db/client.js";
import { lessonCores, lessonLocales, lessonSceneSets } from "../../db/schema.js";
import { normalizeNativeLanguage } from "../../lib/language.js";
import {
  generateCoreForCatalog,
  generateScenesForCore,
  getOrGenerateLocale,
  LayerError,
} from "../lesson/layers.js";
import type { LintReport } from "../lesson/lint.js";
import { lintCore } from "../lesson/lintLayers.js";
import { LESSON_CORE_VERSION } from "../llm/prompts/lesson-core.v1.js";
import { getAdminLessonDetail, getCurrentLayerRows } from "./queries.js";

/**
 * ADMİN AKSİYONLARI — hepsi detail döner (panel tek şekil tüketir).
 *
 * İlkeler:
 *  · Yayın kapısı korunur: yeniden üretim ve elle kayıt satırı `ready`ye düşürür;
 *    `publish` ayrı ve bilinçli adımdır.
 *  · `practice.mustUse` KATALOGDAN gelir — elle kayıtta da kod üzerine yazar.
 *  · Çekirdek/sahne değişince o çekirdeğin BAYAT dil paketleri silinir
 *    (author-cores.ts deseni); hash'i tutan paketlere dokunulmaz.
 *  · Kuyruk yok: LLM uçları senkron (~10–60 sn); toplu iş istemcide orkestre edilir.
 */

export class AdminActionError extends Error {
  constructor(
    public code: "lint_failed" | "layer_not_ready" | "locale_in_progress" | "locale_failed" | "generation_failed",
    public report?: LintReport,
  ) {
    super(code);
  }
}

/** Çekirdek satırının anlattığı içerik değişti: hash'i tutmayan paketler ölü satırdır, sil */
async function pruneStaleLocales(coreId: string, freshHash: string | null): Promise<void> {
  if (!freshHash) return;
  await db.delete(lessonLocales).where(and(eq(lessonLocales.coreId, coreId), ne(lessonLocales.sourceHash, freshHash)));
}

export async function regenerateCore(catalogLessonId: string): Promise<AdminLessonDetail> {
  try {
    const { coreId } = await generateCoreForCatalog(catalogLessonId, { force: true });
    const { hash } = await getCurrentLayerRows(catalogLessonId);
    await pruneStaleLocales(coreId, hash);
  } catch (err) {
    if (err instanceof LayerError) throw new AdminActionError(err.code === "locale_in_progress" ? "locale_in_progress" : "generation_failed");
    throw new AdminActionError("generation_failed", { errors: [String(err).slice(0, 300)], warnings: [] });
  }
  return getAdminLessonDetail(catalogLessonId);
}

export async function regenerateScenes(catalogLessonId: string): Promise<AdminLessonDetail> {
  const { core } = await getCurrentLayerRows(catalogLessonId);
  if (!core?.core) throw new AdminActionError("layer_not_ready");
  try {
    await generateScenesForCore(core.id, { force: true });
    const { hash } = await getCurrentLayerRows(catalogLessonId);
    await pruneStaleLocales(core.id, hash);
  } catch (err) {
    if (err instanceof LayerError) throw new AdminActionError(err.code === "locale_in_progress" ? "locale_in_progress" : "generation_failed");
    throw new AdminActionError("generation_failed", { errors: [String(err).slice(0, 300)], warnings: [] });
  }
  return getAdminLessonDetail(catalogLessonId);
}

/**
 * Elle düzenlenmiş çekirdeği doğrula (+ kaydet). `dry` yalnız raporu döner.
 * Şema denetimi route'ta (400); burada pedagojik lint (422) ve yazım.
 */
export async function saveCore(
  catalogLessonId: string,
  input: LessonCore,
  opts: { dry: boolean },
): Promise<{ report: LintReport; detail: AdminLessonDetail | null }> {
  const { catalog, core: existing, hash: oldHash } = await getCurrentLayerRows(catalogLessonId);

  // mustUse ölçümü besler; modelin de operatörün de düzyazısına bırakılmaz
  const core = lessonCoreSchema.parse({ ...input, practice: { ...input.practice, mustUse: [...catalog.targetPhrases] } });
  const report = lintCore(core, { forbidden: [] });
  if (report.errors.length) throw new AdminActionError("lint_failed", report);
  if (opts.dry) return { report, detail: null };

  const key = {
    catalogLessonId,
    coreFormat: CORE_FORMAT,
    promptVersion: LESSON_CORE_VERSION,
    specHash: catalog.specHash,
  };
  const [row] = await db
    .insert(lessonCores)
    .values({ ...key, status: "ready", core, validationReport: report, model: "authored/admin" })
    .onConflictDoUpdate({
      target: [lessonCores.catalogLessonId, lessonCores.coreFormat, lessonCores.promptVersion, lessonCores.specHash],
      set: { core, status: "ready", validationReport: report, model: "authored/admin", updatedAt: new Date() },
    })
    .returning();

  // Hash SAKLANAN satırdan (parse varsayılan uygulayabilir) — author-cores dersi
  if (row && existing && oldHash) {
    const { hash } = await getCurrentLayerRows(catalogLessonId);
    await pruneStaleLocales(row.id, hash);
  }
  return { report, detail: await getAdminLessonDetail(catalogLessonId) };
}

/**
 * Dil paketi üret / yenile. `force`: anahtarı tutan hazır paket silinir ve
 * yeniden üretilir (aksi hâlde `getOrGenerateLocale` mevcut olanı döner).
 */
export async function generateLocale(
  catalogLessonId: string,
  languageInput: string,
  opts: { force: boolean },
): Promise<AdminLessonDetail> {
  const language = normalizeNativeLanguage(languageInput);
  const { catalog, core, scene, hash } = await getCurrentLayerRows(catalogLessonId);
  const live = (s: string | undefined) => s === "ready" || s === "published";
  if (!core?.core || !scene?.scenes || !hash || !live(core.status) || !live(scene.status)) {
    throw new AdminActionError("layer_not_ready");
  }

  if (opts.force) {
    await db
      .delete(lessonLocales)
      .where(
        and(
          eq(lessonLocales.coreId, core.id),
          eq(lessonLocales.sceneSetId, scene.id),
          eq(lessonLocales.language, language),
          eq(lessonLocales.sourceHash, hash),
          ne(lessonLocales.status, "generating"),
        ),
      );
  }

  try {
    await getOrGenerateLocale({
      core: core.core as LessonCore,
      coreId: core.id,
      sceneSet: { sceneFormat: SCENE_FORMAT, scenes: scene.scenes } as SceneSet,
      sceneSetId: scene.id,
      language,
      cefrLevel: catalog.level,
      titleEn: catalog.title,
      themeHint: catalog.themeHint,
      userId: null,
      sourceHash: hash,
    });
  } catch (err) {
    if (err instanceof LayerError && err.code === "locale_in_progress") throw new AdminActionError("locale_in_progress");
    throw new AdminActionError("locale_failed");
  }

  // Aynı dilin eski (hash'i tutmayan) satırları artık ölü — temizle
  await db
    .delete(lessonLocales)
    .where(and(eq(lessonLocales.coreId, core.id), eq(lessonLocales.language, language), ne(lessonLocales.sourceHash, hash)));

  return getAdminLessonDetail(catalogLessonId);
}

/** Tek dersin çekirdek + sahne setini `ready → published` (publish-level.ts'in tekli hâli) */
export async function publishLesson(catalogLessonId: string): Promise<AdminLessonDetail> {
  const { core, scene } = await getCurrentLayerRows(catalogLessonId);
  const publishable = (s: string | undefined) => s === "ready" || s === "published";
  if (!core || !scene || !publishable(core.status) || !publishable(scene.status)) {
    throw new AdminActionError("layer_not_ready");
  }
  const now = new Date();
  if (core.status === "ready") {
    await db.update(lessonCores).set({ status: "published", updatedAt: now }).where(eq(lessonCores.id, core.id));
  }
  if (scene.status === "ready") {
    await db.update(lessonSceneSets).set({ status: "published", updatedAt: now }).where(eq(lessonSceneSets.id, scene.id));
  }
  return getAdminLessonDetail(catalogLessonId);
}

import { createHash } from "node:crypto";
import {
  assembleLesson,
  CORE_FORMAT,
  L10N_FORMAT,
  SCENE_FORMAT,
  lessonCoreSchema,
  lessonLocalePackSchema,
  permuteChoices,
  sceneSetSchema,
  TRACKS,
  type LessonContentV7,
  type LessonCore,
  type LessonLocalePack,
  type SceneSet,
  type Track,
} from "@glotmate/contracts";
import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { catalogLessons, lessonCores, lessonLocales, lessonSceneSets, userProfiles } from "../../db/schema.js";
import { getChrome } from "../../i18n/index.js";
import { nativeLanguageOf } from "../../lib/language.js";
import { completeJson, modelForPurpose } from "../llm/index.js";
import { buildLessonCorePrompt, LESSON_CORE_VERSION } from "../llm/prompts/lesson-core.v1.js";
import { buildScenesPrompt, LESSON_SCENES_VERSION } from "../llm/prompts/lesson-scenes.v1.js";
import { buildLocalePrompt, LESSON_LOCALE_VERSION } from "../llm/prompts/lesson-locale.v1.js";
import { lintCore, lintLocale, lintScenes } from "./lintLayers.js";
import type { LintReport } from "./lint.js";

/**
 * v7 KATMAN ÇÖZÜMLEMESİ.
 *
 * RUNTIME SINIRI SERTTİR:
 *   çekirdek  → istek anında ASLA üretilmez; yalnızca `published` servis edilir
 *   sahne     → istek anında ASLA üretilmez; yalnızca `published` servis edilir
 *   dil paketi→ tek lazy katman (pedagojik iddia taşımadığı için lint sonrası
 *               doğrudan servis edilebilir)
 *
 * İlk kullanıcı hiçbir zaman yayın öncesi pedagojinin deneği olmaz — üretim ve
 * yayın apps/backend/scripts'teki offline hatta yapılır.
 */

export class LayerError extends Error {
  constructor(
    public code: "not_found" | "core_not_published" | "scenes_not_published" | "locale_failed" | "locale_in_progress",
    message: string,
  ) {
    super(message);
  }
}

/**
 * Dil paketinin ANLATTIĞI her şeyin parmak izi: başlık + çekirdek + sahne seti.
 *
 * Eskiden yalnızca başlığı hash'liyordu ve bu sessiz bir yalan üretiyordu: anahtar
 * `coreId`yi de içeriyor ama çekirdek satırı YERİNDE güncelleniyor (aynı uuid),
 * yani bir dersin iddiası düzeltilince paket eskisini anlatmaya devam ediyor ve
 * bunu hiçbir şey fark etmiyordu. Tek emniyet `author-cores --replace-published`ın
 * paketleri silmesiydi — ama hedefli bir yama script'i onu atlar.
 *
 * İçerik hash'e girince bayatlık YAPISAL olarak yakalanır: iddia değişir → hash
 * değişir → anahtar tutmaz → paket ilk açılışta yeniden üretilir.
 *
 * Anahtar sırasından bağımsız olmalı: Postgres `jsonb` anahtarları yeniden
 * sıralıyor, düz JSON.stringify her okumada farklı hash verirdi.
 */
export function localeSourceHash(titleEn: string, core?: unknown, sceneSet?: unknown): string {
  const canonical = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(canonical);
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.keys(v as Record<string, unknown>)
          .sort()
          .map((k) => [k, canonical((v as Record<string, unknown>)[k])]),
      );
    }
    return v;
  };
  return createHash("sha256")
    .update(titleEn)
    .update(JSON.stringify(canonical(core ?? null)))
    .update(JSON.stringify(canonical(sceneSet ?? null)))
    .digest("hex")
    .slice(0, 12);
}

async function getCatalogLesson(catalogLessonId: string) {
  const [row] = await db
    .select()
    .from(catalogLessons)
    .where(and(eq(catalogLessons.id, catalogLessonId), eq(catalogLessons.status, "active")))
    .limit(1);
  return row ?? null;
}

export async function getPublishedCore(catalogLessonId: string, specHash: string) {
  const [row] = await db
    .select()
    .from(lessonCores)
    .where(
      and(
        eq(lessonCores.catalogLessonId, catalogLessonId),
        eq(lessonCores.coreFormat, CORE_FORMAT),
        eq(lessonCores.promptVersion, LESSON_CORE_VERSION),
        eq(lessonCores.specHash, specHash),
        eq(lessonCores.status, "published"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getPublishedSceneSet(coreId: string) {
  const [row] = await db
    .select()
    .from(lessonSceneSets)
    .where(
      and(
        eq(lessonSceneSets.coreId, coreId),
        eq(lessonSceneSets.sceneFormat, SCENE_FORMAT),
        eq(lessonSceneSets.promptVersion, LESSON_SCENES_VERSION),
        eq(lessonSceneSets.status, "published"),
      ),
    )
    .limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Dil paketi — lazy, claim korumalı
// ---------------------------------------------------------------------------

interface LocaleKey {
  coreId: string;
  sceneSetId: string;
  language: string;
  l10nFormat: number;
  promptVersion: string;
  sourceHash: string;
}

function localeWhere(k: LocaleKey) {
  return and(
    eq(lessonLocales.coreId, k.coreId),
    eq(lessonLocales.sceneSetId, k.sceneSetId),
    eq(lessonLocales.language, k.language),
    eq(lessonLocales.l10nFormat, k.l10nFormat),
    eq(lessonLocales.promptVersion, k.promptVersion),
    eq(lessonLocales.sourceHash, k.sourceHash),
  );
}

export async function getOrGenerateLocale(opts: {
  core: LessonCore;
  coreId: string;
  sceneSet: SceneSet;
  sceneSetId: string;
  language: string;
  cefrLevel: string;
  titleEn: string;
  themeHint: string;
  userId: string | null;
  /**
   * Çağıran hesaplar, çünkü hash SAKLANAN çekirdekten türemeli — buradaki `core`
   * şıkları karıştırılmış SUNUM kopyasıdır ve hash'i sunum sırasına bağlamak
   * yeniden üretimi tetiklerdi.
   */
  sourceHash: string;
}): Promise<{ localeId: string; pack: LessonLocalePack }> {
  const key: LocaleKey = {
    coreId: opts.coreId,
    sceneSetId: opts.sceneSetId,
    language: opts.language,
    l10nFormat: L10N_FORMAT,
    promptVersion: LESSON_LOCALE_VERSION,
    sourceHash: opts.sourceHash,
  };

  const [ready] = await db
    .select()
    .from(lessonLocales)
    .where(and(localeWhere(key), eq(lessonLocales.status, "ready")))
    .limit(1);
  if (ready?.pack) return { localeId: ready.id, pack: ready.pack as LessonLocalePack };

  // Claim: anahtarın TÜM kolonları INSERT'te yazılır (NULL'lu anahtar korumayı çökertir)
  const claimed = await db
    .insert(lessonLocales)
    .values({ ...key, status: "generating", generatedForUserId: opts.userId })
    .onConflictDoNothing()
    .returning();

  if (claimed.length === 0) {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const [row] = await db.select().from(lessonLocales).where(localeWhere(key)).limit(1);
      if (row?.status === "ready" && row.pack) return { localeId: row.id, pack: row.pack as LessonLocalePack };
      if (row?.status === "failed") {
        await db
          .update(lessonLocales)
          .set({ status: "generating", updatedAt: new Date() })
          .where(eq(lessonLocales.id, row.id));
        return await generateLocaleInto(row.id, key, opts);
      }
    }
    throw new LayerError("locale_in_progress", "Dil paketi üretimi başka bir istekte sürüyor");
  }

  return await generateLocaleInto(claimed[0]!.id, key, opts);
}

async function generateLocaleInto(
  rowId: string,
  key: LocaleKey,
  opts: Parameters<typeof getOrGenerateLocale>[0],
): Promise<{ localeId: string; pack: LessonLocalePack }> {
  try {
    let report: LintReport = { errors: [], warnings: [] };
    let pack: LessonLocalePack | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const { system, user } = buildLocalePrompt({
        language: key.language,
        cefrLevel: opts.cefrLevel,
        titleEn: opts.titleEn,
        themeHint: opts.themeHint,
        core: opts.core,
        sceneSet: opts.sceneSet,
      });
      const lintFeedback =
        attempt > 0 && report.errors.length
          ? `\n\nPREVIOUS ATTEMPT FAILED VALIDATION, FIX THESE:\n${report.errors.join("\n")}`
          : "";

      pack = await completeJson({
        purpose: "lesson_locale",
        system,
        user: user + lintFeedback,
        schema: lessonLocalePackSchema,
        promptVersion: LESSON_LOCALE_VERSION,
        userId: opts.userId ?? undefined,
        maxTokens: 2200,
        temperature: 0.3,
      });

      report = lintLocale(pack, opts.core, { forbidden: [], language: key.language });
      if (report.errors.length === 0) break;
    }

    if (!pack || report.errors.length > 0) {
      throw new Error(`Dil paketi lint hataları: ${report.errors.join("; ")}`);
    }

    await db
      .update(lessonLocales)
      .set({
        status: "ready",
        pack,
        validationReport: report,
        model: modelForPurpose("lesson_locale"),
        updatedAt: new Date(),
      })
      .where(eq(lessonLocales.id, rowId));

    return { localeId: rowId, pack };
  } catch (err) {
    await db
      .update(lessonLocales)
      .set({ status: "failed", validationReport: { errors: [String(err).slice(0, 500)] }, updatedAt: new Date() })
      .where(eq(lessonLocales.id, rowId));
    throw new LayerError("locale_failed", "Dil paketi üretilemedi");
  }
}

// ---------------------------------------------------------------------------
// Birleşik çözümleme — route'ların kullandığı tek giriş
// ---------------------------------------------------------------------------

/**
 * Alıştırma MCQ'larının şıklarını deterministik olarak yeniden dizer.
 * `exampleAnswer` metni değişmez ve doğru indeks DEĞERE göre yeniden hesaplandığı
 * için `exampleAnswer === options[correctIndex]` değişmezi korunur (lint kuralı).
 * `quiz` burada karıştırılmaz: quiz maddeleri derste gösterilmiyor, ünite testine
 * gidiyor ve orada dil paketindeki şık geri bildirimiyle birlikte taşınmaları
 * gerekiyor — o iş `buildCheckpoint` içinde yapılır.
 */
function permuteExerciseChoices(core: LessonCore, coreId: string): LessonCore {
  return {
    ...core,
    lecture: {
      ...core.lecture,
      beats: core.lecture.beats.map((b) => {
        if (b.kind !== "exercise" || b.answerSpec.kind !== "choice" || !b.options?.length) return b;
        const p = permuteChoices(`${coreId}:${b.id}`, b.options, b.answerSpec.correctIndex);
        return { ...b, options: p.options, answerSpec: { ...b.answerSpec, correctIndex: p.correctIndex } };
      }),
    },
  };
}

export interface ResolvedLesson {
  content: LessonContentV7;
  core: LessonCore;
  coreId: string;
  sceneSet: SceneSet;
  sceneSetId: string;
  localeId: string | null;
  track: Track;
  catalog: { id: string; titleEn: string; themeHint: string; level: string };
}

/**
 * Kullanıcının profili + katalog satırından birleşik v7 dersi çözer.
 * Çekirdek/sahne yoksa ÜRETMEZ — yayın hattı eksik demektir, hata döner.
 */
export async function resolveLesson(userId: string, catalogLessonId: string): Promise<ResolvedLesson> {
  const lesson = await getCatalogLesson(catalogLessonId);
  if (!lesson) throw new LayerError("not_found", "Ders katalogda bulunamadı");

  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  const language = nativeLanguageOf(profile);
  const track = ((profile?.track as Track) ?? "everyday") as Track;
  const tutorLanguage = (profile?.tutorLanguage ?? "native") as "native" | "english";

  const coreRow = await getPublishedCore(catalogLessonId, lesson.specHash);
  if (!coreRow?.core) {
    throw new LayerError("core_not_published", `"${catalogLessonId}" için yayınlanmış çekirdek yok — üretim/yayın hattı koşulmamış`);
  }
  // Şıklar SERVİS ANINDA karıştırılır — yazılan içerikte doğru şık neredeyse her
  // zaman ilk sıradaydı (bkz. permuteChoices). Burada yapılıyor çünkü bu fonksiyon
  // hem istemci içeriğinin hem judge bağlamının TEK kaynağı: ikisi de aynı diziyi
  // görür. Tohum satır kimliğine bağlı, yani dizilim oturumlar arasında da sabit.
  const core = permuteExerciseChoices(coreRow.core as LessonCore, coreRow.id);

  const sceneRow = await getPublishedSceneSet(coreRow.id);
  if (!sceneRow?.scenes) {
    throw new LayerError("scenes_not_published", `"${catalogLessonId}" için yayınlanmış sahne seti yok`);
  }
  const sceneSet = { sceneFormat: SCENE_FORMAT, scenes: sceneRow.scenes } as SceneSet;
  const scene = sceneSet.scenes[track] ?? sceneSet.scenes[TRACKS[0]]!;

  // İngilizce tutor modunda dil paketi hiç gerekmez; native modda lazy üretilir
  let pack: LessonLocalePack | null = null;
  let localeId: string | null = null;
  if (tutorLanguage === "native" && language !== "en") {
    const res = await getOrGenerateLocale({
      core,
      coreId: coreRow.id,
      sceneSet,
      sceneSetId: sceneRow.id,
      language,
      cefrLevel: lesson.level,
      titleEn: lesson.title,
      themeHint: lesson.themeHint,
      userId,
      // SAKLANAN çekirdekten — permüte edilmiş sunum kopyasından değil
      sourceHash: localeSourceHash(lesson.title, coreRow.core, sceneSet),
    });
    pack = res.pack;
    localeId = res.localeId;
  }

  const chrome = getChrome(pack ? language : "en");
  const content = assembleLesson({
    core,
    scene,
    track,
    pack,
    chrome,
    nativeLanguage: language,
    titleEn: lesson.title,
  });

  return {
    content,
    core,
    coreId: coreRow.id,
    sceneSet,
    sceneSetId: sceneRow.id,
    localeId,
    track,
    catalog: { id: lesson.id, titleEn: lesson.title, themeHint: lesson.themeHint, level: lesson.level },
  };
}

/**
 * Algılanan hız: katalog sırasındaki BİR SONRAKİ dersin dil paketini ısıtır.
 * Çekirdek/sahne üretmez — onlar yayın öncesi hazır olmak zorunda. Paylaşımlı
 * paket sayesinde bu, aynı dildeki HERKESİ ısıtır. Fire-and-forget; hata yutulur.
 */
export async function warmNextLocale(userId: string, catalogLessonId: string): Promise<void> {
  try {
    const current = await getCatalogLesson(catalogLessonId);
    if (!current) return;
    const [next] = await db
      .select({ id: catalogLessons.id })
      .from(catalogLessons)
      .where(
        and(
          eq(catalogLessons.level, current.level),
          eq(catalogLessons.status, "active"),
          gt(catalogLessons.position, current.position),
        ),
      )
      .orderBy(asc(catalogLessons.position))
      .limit(1);
    if (next) await resolveLesson(userId, next.id);
  } catch {
    // ısıtma başarısızlığı kullanıcı akışını asla etkilemez
  }
}

// ---------------------------------------------------------------------------
// OFFLINE üretim — yalnızca scripts/ çağırır (yayın hattı)
// ---------------------------------------------------------------------------

export async function generateCoreForCatalog(catalogLessonId: string): Promise<{ coreId: string; report: LintReport }> {
  const lesson = await getCatalogLesson(catalogLessonId);
  if (!lesson) throw new LayerError("not_found", `Katalogda yok: ${catalogLessonId}`);

  const key = {
    catalogLessonId,
    coreFormat: CORE_FORMAT,
    promptVersion: LESSON_CORE_VERSION,
    specHash: lesson.specHash,
  };

  const [existing] = await db
    .select()
    .from(lessonCores)
    .where(
      and(
        eq(lessonCores.catalogLessonId, key.catalogLessonId),
        eq(lessonCores.coreFormat, key.coreFormat),
        eq(lessonCores.promptVersion, key.promptVersion),
        eq(lessonCores.specHash, key.specHash),
      ),
    )
    .limit(1);
  if (existing && (existing.status === "ready" || existing.status === "published")) {
    return { coreId: existing.id, report: (existing.validationReport as LintReport) ?? { errors: [], warnings: [] } };
  }

  const rowId =
    existing?.id ??
    (
      await db
        .insert(lessonCores)
        .values({ ...key, status: "generating" })
        .onConflictDoNothing()
        .returning()
    )[0]?.id;
  if (!rowId) throw new LayerError("locale_in_progress", "Çekirdek üretimi başka bir süreçte sürüyor");

  try {
    let report: LintReport = { errors: [], warnings: [] };
    let core: LessonCore | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const { system, user } = buildLessonCorePrompt({
        cefrLevel: lesson.level,
        kind: lesson.kind as "phrases" | "grammar" | "practice",
        focus: lesson.focus,
        themeHint: lesson.themeHint,
        targetPhrases: lesson.targetPhrases,
      });
      const lintFeedback =
        attempt > 0 && report.errors.length
          ? `\n\nPREVIOUS ATTEMPT FAILED VALIDATION, FIX THESE:\n${report.errors.join("\n")}`
          : "";

      core = await completeJson({
        purpose: "lesson_core",
        system,
        user: user + lintFeedback,
        schema: lessonCoreSchema,
        promptVersion: LESSON_CORE_VERSION,
        maxTokens: 2500,
        temperature: 0.4,
      });

      // mustUse KODDA dayatılır — ölçümü besleyen değer modelin düzyazısına bırakılmaz
      core.practice.mustUse = [...lesson.targetPhrases];
      report = lintCore(core, { forbidden: [] });
      if (report.errors.length === 0) break;
    }

    if (!core || report.errors.length > 0) throw new Error(`Lint hataları: ${report.errors.join("; ")}`);

    await db
      .update(lessonCores)
      .set({ status: "ready", core, validationReport: report, model: modelForPurpose("lesson_core"), updatedAt: new Date() })
      .where(eq(lessonCores.id, rowId));
    return { coreId: rowId, report };
  } catch (err) {
    await db
      .update(lessonCores)
      .set({ status: "failed", validationReport: { errors: [String(err).slice(0, 500)] }, updatedAt: new Date() })
      .where(eq(lessonCores.id, rowId));
    throw err;
  }
}

export async function generateScenesForCore(coreId: string): Promise<{ sceneSetId: string; report: LintReport }> {
  const [coreRow] = await db.select().from(lessonCores).where(eq(lessonCores.id, coreId)).limit(1);
  if (!coreRow?.core) throw new LayerError("not_found", `Çekirdek yok: ${coreId}`);
  const lesson = await getCatalogLesson(coreRow.catalogLessonId);
  if (!lesson) throw new LayerError("not_found", `Katalogda yok: ${coreRow.catalogLessonId}`);
  const core = coreRow.core as LessonCore;

  const key = { coreId, sceneFormat: SCENE_FORMAT, promptVersion: LESSON_SCENES_VERSION };
  const [existing] = await db
    .select()
    .from(lessonSceneSets)
    .where(
      and(
        eq(lessonSceneSets.coreId, key.coreId),
        eq(lessonSceneSets.sceneFormat, key.sceneFormat),
        eq(lessonSceneSets.promptVersion, key.promptVersion),
      ),
    )
    .limit(1);
  if (existing && (existing.status === "ready" || existing.status === "published")) {
    return { sceneSetId: existing.id, report: (existing.validationReport as LintReport) ?? { errors: [], warnings: [] } };
  }

  const rowId =
    existing?.id ??
    (
      await db
        .insert(lessonSceneSets)
        .values({ ...key, status: "generating" })
        .onConflictDoNothing()
        .returning()
    )[0]?.id;
  if (!rowId) throw new LayerError("locale_in_progress", "Sahne üretimi başka bir süreçte sürüyor");

  try {
    let report: LintReport = { errors: [], warnings: [] };
    let set: SceneSet | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const { system, user } = buildScenesPrompt({
        cefrLevel: lesson.level,
        core: { topic: core.topic, focus: core.focus, communicationGoal: core.communicationGoal, practice: core.practice },
        themeHint: lesson.themeHint,
      });
      const lintFeedback =
        attempt > 0 && report.errors.length
          ? `\n\nPREVIOUS ATTEMPT FAILED VALIDATION, FIX THESE:\n${report.errors.join("\n")}`
          : "";

      set = await completeJson({
        purpose: "lesson_scenes",
        system,
        user: user + lintFeedback,
        schema: sceneSetSchema,
        promptVersion: LESSON_SCENES_VERSION,
        maxTokens: 1800,
        temperature: 0.5,
      });

      report = lintScenes(set, { forbidden: [] });
      if (report.errors.length === 0) break;
    }

    if (!set || report.errors.length > 0) throw new Error(`Lint hataları: ${report.errors.join("; ")}`);

    await db
      .update(lessonSceneSets)
      .set({ status: "ready", scenes: set.scenes, validationReport: report, model: modelForPurpose("lesson_scenes"), updatedAt: new Date() })
      .where(eq(lessonSceneSets.id, rowId));
    return { sceneSetId: rowId, report };
  } catch (err) {
    await db
      .update(lessonSceneSets)
      .set({ status: "failed", validationReport: { errors: [String(err).slice(0, 500)] }, updatedAt: new Date() })
      .where(eq(lessonSceneSets.id, rowId));
    throw err;
  }
}

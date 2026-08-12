import { CONTENT_FORMAT, lessonContentSchema, type LessonContent, type LessonKind } from "@arna/contracts";
import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { catalogLessons, lessonContents, userProfiles } from "../../db/schema.js";
import { nativeLanguageOf } from "../../lib/language.js";
import { completeJson, modelForPurpose } from "../llm/index.js";
import { buildLessonGenPrompt, LESSON_GEN_VERSION } from "../llm/prompts/lesson-gen.v8.js";
import { lintLesson, type LintReport } from "./lint.js";

export class LessonError extends Error {
  constructor(
    public code: "not_found" | "generation_failed" | "in_progress_elsewhere",
    message: string,
  ) {
    super(message);
  }
}

interface LessonResult {
  /** PAYLAŞIMLI içerik satırının kimliği — kullanıcıya ait değildir */
  lessonId: string;
  content: LessonContent;
  report: LintReport;
}

/**
 * İçerik önbellek anahtarı. ALTI ALAN DA ZORUNLU ve claim eden INSERT tarafından
 * yazılır: Postgres unique index'te NULL'ları farklı saydığı için anahtarın bir
 * parçası sonradan doldurulursa "tek üretim uçuşta" koruması sessizce çöker.
 */
interface CacheKey {
  catalogLessonId: string;
  nativeLanguage: string;
  track: string;
  formatVersion: number;
  promptVersion: string;
  specHash: string;
}

function keyWhere(k: CacheKey) {
  return and(
    eq(lessonContents.catalogLessonId, k.catalogLessonId),
    eq(lessonContents.nativeLanguage, k.nativeLanguage),
    eq(lessonContents.track, k.track),
    eq(lessonContents.formatVersion, k.formatVersion),
    eq(lessonContents.promptVersion, k.promptVersion),
    eq(lessonContents.specHash, k.specHash),
  );
}

/** Katalog satırı — kullanıcıya ait değil, herkes için aynı. */
async function getCatalogLesson(catalogLessonId: string) {
  const [row] = await db
    .select()
    .from(catalogLessons)
    .where(and(eq(catalogLessons.id, catalogLessonId), eq(catalogLessons.status, "active")))
    .limit(1);
  return row ?? null;
}

/**
 * İçerik varsa döner; yoksa üretir, lint'ler, kaydeder.
 *
 * SAHİPLİK KONTROLÜ YOK — ve olmamalı. Katalog herkese açıktır (CLAUDE.md:
 * "Tüm dersler açık — kullanıcı istediğine atlar"), içerik ise kullanıcıdan
 * bağımsızdır (lint isim/kişisel veri sızıntısını yasaklar). Kötüye kullanım
 * route'taki oran sınırıyla tutuluyor, sahiplik join'iyle değil.
 */
export async function getOrGenerateLesson(
  userId: string,
  catalogLessonId: string,
): Promise<LessonResult> {
  const lesson = await getCatalogLesson(catalogLessonId);
  if (!lesson) throw new LessonError("not_found", "Ders katalogda bulunamadı");

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const key: CacheKey = {
    catalogLessonId,
    nativeLanguage: nativeLanguageOf(profile),
    track: profile?.track ?? "conversation",
    formatVersion: CONTENT_FORMAT,
    promptVersion: LESSON_GEN_VERSION,
    specHash: lesson.specHash,
  };

  // Bayat satır aranmaz: promptVersion ve specHash zaten anahtarın içinde, yani
  // katalog düzeltmesi ya da prompt sürümü değişince ARANAN ANAHTAR değişiyor.
  // Eski satır yerinde kalır — geri alma bedava.
  const [ready] = await db
    .select()
    .from(lessonContents)
    .where(and(keyWhere(key), eq(lessonContents.status, "ready")))
    .limit(1);

  if (ready?.content) {
    return {
      lessonId: ready.id,
      content: ready.content as LessonContent,
      report: (ready.validationReport as LintReport) ?? { errors: [], warnings: [] },
    };
  }

  // Eşzamanlı çift üretim koruması: unique index'e yaslanarak satırı al
  const claimed = await db
    .insert(lessonContents)
    .values({ ...key, status: "generating", generatedForUserId: userId })
    .onConflictDoNothing()
    .returning();

  if (claimed.length === 0) {
    // Başkası üretiyor ya da önceki deneme başarısız kalmış
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const [row] = await db.select().from(lessonContents).where(keyWhere(key)).limit(1);
      if (row?.status === "ready" && row.content) {
        return {
          lessonId: row.id,
          content: row.content as LessonContent,
          report: (row.validationReport as LintReport) ?? { errors: [], warnings: [] },
        };
      }
      if (row?.status === "failed") {
        await db
          .update(lessonContents)
          .set({ status: "generating", updatedAt: new Date() })
          .where(eq(lessonContents.id, row.id));
        return await generateInto(row.id, userId, lesson);
      }
    }
    throw new LessonError("in_progress_elsewhere", "Ders üretimi başka bir istekte sürüyor");
  }

  return await generateInto(claimed[0]!.id, userId, lesson);
}

/** Bu kullanıcının anahtarına düşen HAZIR içerik satırı; yoksa null. Üretim tetiklemez. */
export async function findReadyContent(userId: string, catalogLessonId: string) {
  const lesson = await getCatalogLesson(catalogLessonId);
  if (!lesson) return null;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const [row] = await db
    .select()
    .from(lessonContents)
    .where(
      and(
        keyWhere({
          catalogLessonId,
          nativeLanguage: nativeLanguageOf(profile),
          track: profile?.track ?? "conversation",
          formatVersion: CONTENT_FORMAT,
          promptVersion: LESSON_GEN_VERSION,
          specHash: lesson.specHash,
        }),
        eq(lessonContents.status, "ready"),
      ),
    )
    .limit(1);

  return row?.content ? { lesson, row, content: row.content as LessonContent } : null;
}

/**
 * Algılanan hız: katalog sırasında sonraki dersi arka planda üret. Paylaşımlı
 * önbellek sayesinde bu, yalnızca bu kullanıcıyı değil aynı dil+track'teki
 * HERKESİ ısıtır. Route'tan fire-and-forget çağrılır — beklenmez, hatası yutulur.
 */
export async function pregenerateNext(userId: string, catalogLessonId: string): Promise<void> {
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

  if (next) await getOrGenerateLesson(userId, next.id).catch(() => undefined);
}

async function generateInto(
  contentRowId: string,
  userId: string,
  lesson: typeof catalogLessons.$inferSelect,
): Promise<LessonResult> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  // occupation ve interests ÜRETİME GİRMEZ: içerik paylaşımlı, serbest metin bir
  // meslek alanı başka öğrencilere sızardı. Sahne bağlamı katalogdaki themeHint'ten.
  const ctx = {
    nativeLanguage: nativeLanguageOf(profile),
    cefrLevel: lesson.level,
    track: profile?.track ?? "conversation",
    lesson: {
      kind: lesson.kind as LessonKind,
      title: lesson.title,
      focus: lesson.focus,
      themeHint: lesson.themeHint,
      targetPhrases: lesson.targetPhrases,
    },
  };

  // Sızıntı denetimi: bu değerlerden hiçbiri paylaşımlı içerikte görünmemeli
  const forbidden = [profile?.displayName, profile?.occupation].filter(
    (v): v is string => typeof v === "string" && v.trim().length >= 3,
  );

  try {
    let report: LintReport = { errors: [], warnings: [] };
    let content: LessonContent | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const { system, user } = buildLessonGenPrompt(ctx);
      const lintFeedback =
        attempt > 0 && report.errors.length
          ? `\n\nÖNCEKİ ÜRETİM ŞU LINT HATALARINI VERDİ, DÜZELT:\n${report.errors.join("\n")}`
          : "";

      content = await completeJson({
        purpose: "lesson_gen",
        system,
        user: user + lintFeedback,
        schema: lessonContentSchema,
        promptVersion: LESSON_GEN_VERSION,
        userId,
        maxTokens: 2500,
        temperature: 0.4, // düşük: focus'a sadakat yaratıcılıktan önemli
      });

      // mustUse KODDA dayatılır. Prompt zaten birebir kopyalamasını istiyor ama
      // modelin düzyazısına güvenmek bu alanda iki kez canlı hataya yol açtı —
      // ölçümü besleyen değer katalogdan gelir, üretimden değil.
      content.practice.mustUse = [...lesson.targetPhrases];

      report = lintLesson(content, { forbidden });
      if (report.errors.length === 0) break;
    }

    if (!content || report.errors.length > 0) {
      throw new Error(`Lint hataları giderilemedi: ${report.errors.join("; ")}`);
    }

    await db
      .update(lessonContents)
      .set({
        status: "ready",
        content,
        validationReport: report,
        model: modelForPurpose("lesson_gen"),
        updatedAt: new Date(),
      })
      .where(eq(lessonContents.id, contentRowId));

    return { lessonId: contentRowId, content, report };
  } catch (err) {
    await db
      .update(lessonContents)
      .set({
        status: "failed",
        validationReport: { errors: [String(err).slice(0, 500)] },
        updatedAt: new Date(),
      })
      .where(eq(lessonContents.id, contentRowId));
    throw new LessonError("generation_failed", "Ders içeriği üretilemedi");
  }
}

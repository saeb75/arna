import { CONTENT_FORMAT, lessonContentSchema, type LessonContent } from "@arna/contracts";
import { and, asc, eq, gt, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { lessons, programLessons, programs, userProfiles } from "../../db/schema.js";
import { nativeLanguageOf } from "../../lib/language.js";
import { completeJson, modelForPurpose } from "../llm/index.js";
import { buildLessonGenPrompt, LESSON_GEN_VERSION } from "../llm/prompts/lesson-gen.v7.js";
import { lintLesson, type LintReport } from "./lint.js";

/**
 * Bayat içerik otomatik yeniden üretilir (kullanıcı bir şey yapmaz).
 * formatVersion'a bakılır: eskiden yalnızca "lecture var mı" kontrol ediliyordu,
 * bu yüzden prompt/şema değişse bile hiçbir satır bayatlamıyordu.
 */
function isCurrentFormat(content: unknown, promptVersion: string | null): content is LessonContent {
  if (!content || typeof content !== "object") return false;
  if ((content as { formatVersion?: number }).formatVersion !== CONTENT_FORMAT) return false;
  return promptVersion === LESSON_GEN_VERSION;
}

export class LessonError extends Error {
  constructor(
    public code: "not_found" | "generation_failed" | "in_progress_elsewhere",
    message: string,
  ) {
    super(message);
  }
}

interface LessonResult {
  lessonId: string;
  content: LessonContent;
  report: LintReport;
}

/** Plan satırını sahiplik kontrolüyle getirir. */
async function getOwnedPlanRow(userId: string, programLessonId: string) {
  const [row] = await db
    .select({
      pl: programLessons,
      programUserId: programs.userId,
      level: programs.level,
      track: programs.track,
    })
    .from(programLessons)
    .innerJoin(programs, eq(programLessons.programId, programs.id))
    .where(and(eq(programLessons.id, programLessonId), eq(programs.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** İçerik varsa döner; yoksa üretir, lint'ler, kaydeder. Tembel üretimin kalbi. */
export async function getOrGenerateLesson(
  userId: string,
  programLessonId: string,
): Promise<LessonResult> {
  const owned = await getOwnedPlanRow(userId, programLessonId);
  if (!owned) throw new LessonError("not_found", "Ders bulunamadı veya kullanıcıya ait değil");

  const [existing] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.programLessonId, programLessonId), eq(lessons.status, "ready")))
    .limit(1);

  if (existing && isCurrentFormat(existing.content, existing.promptVersion)) {
    return {
      lessonId: existing.id,
      content: existing.content,
      report: (existing.validationReport as LintReport) ?? { errors: [], warnings: [] },
    };
  }

  // Eski formatta içerik varsa satırı devral ve yeniden üret (kullanıcı bir şey yapmaz)
  if (existing) {
    await db.update(lessons).set({ status: "generating" }).where(eq(lessons.id, existing.id));
    return await generateInto(existing.id, userId, programLessonId, owned);
  }

  // Eşzamanlı çift üretim koruması: generating satırını unique index'e yaslanarak al
  const claimed = await db
    .insert(lessons)
    .values({ programLessonId, userId, version: 1, status: "generating" })
    .onConflictDoNothing()
    .returning();

  if (claimed.length === 0) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const [row] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.programLessonId, programLessonId))
        .limit(1);
      if (row?.status === "ready" && row.content) {
        return {
          lessonId: row.id,
          content: row.content as LessonContent,
          report: (row.validationReport as LintReport) ?? { errors: [], warnings: [] },
        };
      }
      if (row?.status === "failed") {
        await db.update(lessons).set({ status: "generating" }).where(eq(lessons.id, row.id));
        return await generateInto(row.id, userId, programLessonId, owned);
      }
    }
    throw new LessonError("in_progress_elsewhere", "Ders üretimi başka bir istekte sürüyor");
  }

  return await generateInto(claimed[0]!.id, userId, programLessonId, owned);
}

/**
 * Algılanan hız: aynı programda sıradaki üretilmemiş dersi arka planda üret.
 * Route'tan fire-and-forget çağrılır — asla beklenmez, hatası yutulur.
 */
export async function pregenerateNext(userId: string, programLessonId: string): Promise<void> {
  const owned = await getOwnedPlanRow(userId, programLessonId);
  if (!owned) return;

  const [next] = await db
    .select({ id: programLessons.id })
    .from(programLessons)
    .leftJoin(lessons, eq(lessons.programLessonId, programLessons.id))
    .where(
      and(
        eq(programLessons.programId, owned.pl.programId),
        gt(programLessons.position, owned.pl.position),
        eq(programLessons.status, "not_started"),
        isNull(lessons.id), // hiç içerik satırı olmayanlar — üretilmiş/üretilmekte olan atlanır
      ),
    )
    .orderBy(asc(programLessons.position))
    .limit(1);

  if (next) {
    await getOrGenerateLesson(userId, next.id).catch(() => undefined);
  }
}

async function generateInto(
  lessonRowId: string,
  userId: string,
  programLessonId: string,
  owned: NonNullable<Awaited<ReturnType<typeof getOwnedPlanRow>>>,
): Promise<LessonResult> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  // Ad üretime GİRMEZ (içerik kullanıcıdan bağımsız olmalı) — yalnızca lint,
  // adın içeriğe sızıp sızmadığını denetlemek için biliyor.
  const displayName = profile?.displayName ?? "Student";

  const ctx = {
    nativeLanguage: nativeLanguageOf(profile),
    cefrLevel: owned.level,
    track: owned.track,
    occupation: profile?.occupation ?? null,
    interests: profile?.interests ?? [],
    lesson: {
      title: owned.pl.title,
      focus: owned.pl.focus,
      theme: owned.pl.theme,
    },
  };

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
        maxTokens: 2500, // kısa ders — üretim süresi de kısalır
        temperature: 0.4, // düşük: focus'a sadakat yaratıcılıktan önemli
      });

      report = lintLesson(content, { displayName });
      if (report.errors.length === 0) break;
    }

    if (!content || report.errors.length > 0) {
      throw new Error(`Lint hataları giderilemedi: ${report.errors.join("; ")}`);
    }

    await db
      .update(lessons)
      .set({
        status: "ready",
        content,
        validationReport: report,
        model: modelForPurpose("lesson_gen"),
        promptVersion: LESSON_GEN_VERSION,
      })
      .where(eq(lessons.id, lessonRowId));

    return { lessonId: lessonRowId, content, report };
  } catch (err) {
    await db
      .update(lessons)
      .set({ status: "failed", validationReport: { errors: [String(err).slice(0, 500)] } })
      .where(eq(lessons.id, lessonRowId));
    throw new LessonError("generation_failed", "Ders içeriği üretilemedi");
  }
}


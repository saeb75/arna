import type { CefrLevel, CurriculumResponse, LessonKind, LessonStatus, Track } from "@arna/contracts";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { catalogLessons, catalogUnits, lessonProgress, userProfiles } from "../../db/schema.js";
import { CURRICULUM } from "../../curriculum/index.js";

export class CurriculumError extends Error {
  constructor(public code: "no_profile") {
    super(code);
  }
}

/**
 * Kullanıcının müfredat görünümü: SABİT katalog + kendi ilerlemesi, ünitelere gruplu.
 *
 * Katalog herkeste aynıdır; kullanıcıya özel olan tek şey `lesson_progress`
 * satırlarıdır ve o tablo SEYREKTİR — satırı olmayan ders "not_started" sayılır.
 * Bu yüzden yeni kullanıcı için hiç ilerleme satırı olmaması normaldir ve 404
 * DEĞİL, tamamı not_started olan dolu bir liste döner.
 */
export async function getCurriculumForUser(userId: string): Promise<CurriculumResponse> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  if (!profile) throw new CurriculumError("no_profile");

  const level = profile.cefrLevel as CefrLevel;

  const rows = await db
    .select({
      id: catalogLessons.id,
      position: catalogLessons.position,
      unitIndex: catalogLessons.unitIndex,
      kind: catalogLessons.kind,
      title: catalogLessons.title,
      focus: catalogLessons.focus,
      status: lessonProgress.status,
    })
    .from(catalogLessons)
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.catalogLessonId, catalogLessons.id),
        eq(lessonProgress.userId, userId),
      ),
    )
    .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active")))
    .orderBy(asc(catalogLessons.position));

  const unitRows = await db
    .select()
    .from(catalogUnits)
    .where(and(eq(catalogUnits.level, level), eq(catalogUnits.status, "active")))
    .orderBy(asc(catalogUnits.unitIndex));

  const byUnit = new Map<number, CurriculumResponse["units"][number]["lessons"]>();
  let completed = 0;
  for (const r of rows) {
    const status: LessonStatus =
      r.status === "completed" ? "completed" : r.status === "in_progress" ? "in_progress" : "not_started";
    if (status === "completed") completed++;

    const list = byUnit.get(r.unitIndex) ?? [];
    list.push({
      id: r.id,
      position: r.position,
      unitIndex: r.unitIndex,
      kind: r.kind as LessonKind,
      title: r.title,
      focus: r.focus,
      status,
    });
    byUnit.set(r.unitIndex, list);
  }

  const units = unitRows
    .map((u) => ({
      index: u.unitIndex,
      title: u.title,
      goal: u.goal,
      lessons: byUnit.get(u.unitIndex) ?? [],
    }))
    .filter((u) => u.lessons.length > 0);

  return {
    level,
    label: CURRICULUM[level]?.label ?? level,
    track: profile.track as Track,
    units,
    totals: { lessons: rows.length, completed },
  };
}

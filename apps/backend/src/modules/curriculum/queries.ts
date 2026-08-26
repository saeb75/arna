import {
  checkpointPassed,
  type CefrLevel,
  type CurriculumResponse,
  type LessonKind,
  type LessonStatus,
  type Track,
  type UnitCheckpointSummary,
} from "@arna/contracts";
import { and, asc, eq, not, like, type Column } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  catalogLessons,
  catalogUnits,
  lessonProgress,
  unitCheckpoints,
  userProfiles,
} from "../../db/schema.js";
import { CURRICULUM } from "../../curriculum/index.js";

/**
 * Test fixture'ları PAYLAŞIMLI kataloğa yazıyor (`scripts/_fixture.ts`, `zz-` öneki)
 * ve her koşuda satırı `status='active'`e geri çeviriyor — `seed-curriculum` onları
 * emekliye ayırsa bile bir sonraki test koşusu geri diriltiyor. Bu yüzden guard
 * YAZMA tarafında değil, SERVİS tarafında duruyor: canlıda bir kullanıcının ders
 * listesinde "Test Unit / Test Lesson 1" görünmesi, seed'in ne zaman koştuğuna
 * bağlı olamaz.
 */
const notFixture = (col: Column) => not(like(col, "zz-%"));

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
    .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active"), notFixture(catalogLessons.id)))
    .orderBy(asc(catalogLessons.position));

  const unitRows = await db
    .select()
    .from(catalogUnits)
    .where(and(eq(catalogUnits.level, level), eq(catalogUnits.status, "active"), notFixture(catalogUnits.id)))
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

  // Ünite testi geçmişi. Kullanıcı başına birkaç satır olduğu için hepsi tek
  // sorguyla gelir; ÖZET SQL'de değil JS'te çıkarılır ki geçme kararı
  // contracts'taki `checkpointPassed`ten geçsin — kural tek yerde yaşasın.
  const attempts = await db
    .select({
      unitIndex: unitCheckpoints.unitIndex,
      score: unitCheckpoints.score,
      total: unitCheckpoints.total,
    })
    .from(unitCheckpoints)
    .where(and(eq(unitCheckpoints.userId, userId), eq(unitCheckpoints.level, level)));

  const checkpointByUnit = new Map<number, UnitCheckpointSummary>();
  for (const a of attempts) {
    const prev = checkpointByUnit.get(a.unitIndex);
    // "En iyi deneme" oran üzerinden — madde havuzu küçüldüğünde total değişebiliyor.
    // BAŞARISIZ BİR DENEME KAZANILMIŞ ROZETİ GERİ ALMAZ: passed birikimlidir.
    const better = !prev || a.score / a.total > prev.bestScore / prev.total;
    checkpointByUnit.set(a.unitIndex, {
      passed: (prev?.passed ?? false) || checkpointPassed(a.score, a.total),
      bestScore: better ? a.score : prev.bestScore,
      total: better ? a.total : prev.total,
    });
  }

  const units = unitRows
    .map((u) => ({
      index: u.unitIndex,
      title: u.title,
      goal: u.goal,
      lessons: byUnit.get(u.unitIndex) ?? [],
      checkpoint: checkpointByUnit.get(u.unitIndex) ?? null,
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

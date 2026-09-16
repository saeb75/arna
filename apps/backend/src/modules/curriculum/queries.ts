import {
  CEFR_LEVELS,
  checkpointPassed,
  type CefrLevel,
  type CurriculumLevel,
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
 * Kullanıcının müfredat görünümü: SABİT katalog + kendi ilerlemesi, TÜM
 * seviyeler CEFR sırasında (`levels`), ünitelere gruplu. Üst düzey
 * `level/label/units/totals` PROFİL seviyesinin dilimini yansıtmaya devam eder
 * (web ve eski tüketiciler için birebir eski davranış) — mobil tek uzun yolu
 * `levels`ten kurar ve profil seviyesine odaklanır.
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

  const profileLevel = profile.cefrLevel as CefrLevel;

  // Tek indeksli tarama (~395 satır): catalog_lessons_level_pos_idx (level, position)
  const rows = await db
    .select({
      id: catalogLessons.id,
      level: catalogLessons.level,
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
    .where(and(eq(catalogLessons.status, "active"), notFixture(catalogLessons.id)))
    .orderBy(asc(catalogLessons.level), asc(catalogLessons.position));

  const unitRows = await db
    .select()
    .from(catalogUnits)
    .where(and(eq(catalogUnits.status, "active"), notFixture(catalogUnits.id)))
    .orderBy(asc(catalogUnits.level), asc(catalogUnits.unitIndex));

  // unitIndex seviye İÇİ tekildir (A1 ü3 ≠ B1 ü3) — tüm haritalar seviyeyle anahtarlanır
  const unitKey = (level: string, unitIndex: number) => `${level}-${unitIndex}`;

  const byUnit = new Map<string, CurriculumResponse["units"][number]["lessons"]>();
  const completedByLevel = new Map<string, number>();
  const lessonsByLevel = new Map<string, number>();
  for (const r of rows) {
    const status: LessonStatus =
      r.status === "completed" ? "completed" : r.status === "in_progress" ? "in_progress" : "not_started";
    if (status === "completed") completedByLevel.set(r.level, (completedByLevel.get(r.level) ?? 0) + 1);
    lessonsByLevel.set(r.level, (lessonsByLevel.get(r.level) ?? 0) + 1);

    const key = unitKey(r.level, r.unitIndex);
    const list = byUnit.get(key) ?? [];
    list.push({
      id: r.id,
      position: r.position,
      unitIndex: r.unitIndex,
      kind: r.kind as LessonKind,
      title: r.title,
      focus: r.focus,
      status,
    });
    byUnit.set(key, list);
  }

  // Ünite testi geçmişi. Kullanıcı başına birkaç satır olduğu için hepsi tek
  // sorguyla gelir; ÖZET SQL'de değil JS'te çıkarılır ki geçme kararı
  // contracts'taki `checkpointPassed`ten geçsin — kural tek yerde yaşasın.
  const attempts = await db
    .select({
      level: unitCheckpoints.level,
      unitIndex: unitCheckpoints.unitIndex,
      score: unitCheckpoints.score,
      total: unitCheckpoints.total,
    })
    .from(unitCheckpoints)
    .where(eq(unitCheckpoints.userId, userId));

  const checkpointByUnit = new Map<string, UnitCheckpointSummary>();
  for (const a of attempts) {
    const key = unitKey(a.level, a.unitIndex);
    const prev = checkpointByUnit.get(key);
    // "En iyi deneme" oran üzerinden — madde havuzu küçüldüğünde total değişebiliyor.
    // BAŞARISIZ BİR DENEME KAZANILMIŞ ROZETİ GERİ ALMAZ: passed birikimlidir.
    const better = !prev || a.score / a.total > prev.bestScore / prev.total;
    checkpointByUnit.set(key, {
      passed: (prev?.passed ?? false) || checkpointPassed(a.score, a.total),
      bestScore: better ? a.score : prev.bestScore,
      total: better ? a.total : prev.total,
    });
  }

  const levels: CurriculumLevel[] = CEFR_LEVELS.map((level) => {
    const units = unitRows
      .filter((u) => u.level === level)
      .map((u) => ({
        index: u.unitIndex,
        title: u.title,
        goal: u.goal,
        lessons: byUnit.get(unitKey(level, u.unitIndex)) ?? [],
        checkpoint: checkpointByUnit.get(unitKey(level, u.unitIndex)) ?? null,
      }))
      .filter((u) => u.lessons.length > 0);
    return {
      level,
      label: CURRICULUM[level]?.label ?? level,
      units,
      totals: {
        lessons: lessonsByLevel.get(level) ?? 0,
        completed: completedByLevel.get(level) ?? 0,
      },
    };
  }).filter((l) => l.units.length > 0);

  const own = levels.find((l) => l.level === profileLevel);

  return {
    level: profileLevel,
    label: CURRICULUM[profileLevel]?.label ?? profileLevel,
    track: profile.track as Track,
    units: own?.units ?? [],
    totals: own?.totals ?? { lessons: 0, completed: 0 },
    levels,
  };
}

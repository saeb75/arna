/**
 * Katalog seed'i — repo'daki src/curriculum/*.ts dosyalarını DB'ye yazar.
 *
 *   set -a; source .env; set +a; npx tsx scripts/seed-curriculum.ts [--dry-run]
 *
 * DOĞRULUK KAYNAĞI REPO'DUR, DB türetilmiş projeksiyondur. Script idempotenttir:
 * `id` üzerinden upsert eder, tekrar çalıştırmak satır sayısını değiştirmez.
 *
 * Katalogdan çıkarılan satır SİLİNMEZ, `status='retired'` olur — üretilmiş içerik
 * ve kullanıcı ilerlemesi bu satırlara bakıyor, silmek onları da götürürdü.
 *
 * `specHash` değişen satırları ayrıca raporlar: bu, o dersin üretilmiş içeriğinin
 * bayatladığı ve ilk açılışta yeniden üretileceği anlamına gelir.
 */
import { and, eq, notInArray, sql as raw } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, catalogUnits, lessonContents } from "../src/db/schema.js";
import { AUTHORED_LEVELS, CURRICULUM, lessonId, specHash, unitId } from "../src/curriculum/index.js";

const DRY_RUN = process.argv.includes("--dry-run");

interface Counters {
  unitsInserted: number;
  unitsUpdated: number;
  lessonsInserted: number;
  lessonsUpdated: number;
  lessonsRespecced: number;
  retired: number;
  staleContents: number;
}

const c: Counters = {
  unitsInserted: 0,
  unitsUpdated: 0,
  lessonsInserted: 0,
  lessonsUpdated: 0,
  lessonsRespecced: 0,
  retired: 0,
  staleContents: 0,
};

console.log(`\nKATALOG SEED${DRY_RUN ? " (dry-run — hiçbir şey yazılmaz)" : ""}\n`);

for (const level of AUTHORED_LEVELS) {
  const spec = CURRICULUM[level];
  if (!spec) continue;

  // Mevcut durumu önce oku — ne değişeceğini yazmadan önce raporlayabilmek için
  const existingUnits = await db
    .select({ id: catalogUnits.id })
    .from(catalogUnits)
    .where(eq(catalogUnits.level, level));
  const existingUnitIds = new Set(existingUnits.map((u) => u.id));

  const existingLessons = await db
    .select({ id: catalogLessons.id, specHash: catalogLessons.specHash })
    .from(catalogLessons)
    .where(eq(catalogLessons.level, level));
  const existingLessonHash = new Map(existingLessons.map((l) => [l.id, l.specHash]));

  const wantedUnitIds = spec.units.map((u) => unitId(level, u.index));
  const wantedLessonIds = spec.lessons.map((l) => lessonId(level, l));

  // --- Üniteler -------------------------------------------------------------
  for (const u of spec.units) {
    const id = unitId(level, u.index);
    if (existingUnitIds.has(id)) c.unitsUpdated++;
    else c.unitsInserted++;

    if (DRY_RUN) continue;
    await db
      .insert(catalogUnits)
      .values({ id, level, unitIndex: u.index, title: u.title, goal: u.goal, status: "active" })
      .onConflictDoUpdate({
        target: catalogUnits.id,
        set: {
          level,
          unitIndex: u.index,
          title: u.title,
          goal: u.goal,
          status: "active",
          updatedAt: new Date(),
        },
      });
  }

  // --- Pozisyon park alanı ----------------------------------------------------
  // Araya ders EKLEMEK sonraki pozisyonları kaydırır; satır satır upsert ederken
  // (level, position) unique index'i geçici çakışma üretir (canlıda: yeni satır 27'yi
  // isterken eski satır hâlâ 27'deydi). Önce seviyenin tüm satırları +10000 park
  // alanına itilir; upsert'ler gerçek pozisyonları yazar. Emekli satırlar parkta
  // kalır ve `< 10000` şartı sayesinde her koşuda yeniden itilip taşmaz.
  if (!DRY_RUN) {
    await db
      .update(catalogLessons)
      .set({ position: raw`${catalogLessons.position} + 10000` })
      .where(and(eq(catalogLessons.level, level), raw`${catalogLessons.position} < 10000`));
  }

  // --- Dersler --------------------------------------------------------------
  for (const l of spec.lessons) {
    const id = lessonId(level, l);
    const hash = specHash(level, l);
    const prevHash = existingLessonHash.get(id);

    if (prevHash === undefined) c.lessonsInserted++;
    else {
      c.lessonsUpdated++;
      if (prevHash !== hash) {
        c.lessonsRespecced++;
        // Bu dersin üretilmiş içerikleri artık başka bir anahtarda; bayatladılar
        const [stale] = await db
          .select({ n: raw<number>`count(*)::int` })
          .from(lessonContents)
          .where(eq(lessonContents.catalogLessonId, id));
        c.staleContents += stale?.n ?? 0;
        console.log(`  ~ ${id}: spec değişti (${prevHash} → ${hash})`);
      }
    }

    if (DRY_RUN) continue;
    await db
      .insert(catalogLessons)
      .values({
        id,
        unitId: unitId(level, l.unitIndex),
        level,
        position: l.position,
        unitIndex: l.unitIndex,
        kind: l.kind,
        title: l.title,
        focus: l.focus,
        themeHint: l.themeHint,
        targetPhrases: l.targetPhrases,
        specHash: hash,
        status: "active",
      })
      .onConflictDoUpdate({
        target: catalogLessons.id,
        set: {
          unitId: unitId(level, l.unitIndex),
          level,
          position: l.position,
          unitIndex: l.unitIndex,
          kind: l.kind,
          title: l.title,
          focus: l.focus,
          themeHint: l.themeHint,
          targetPhrases: l.targetPhrases,
          specHash: hash,
          status: "active",
          updatedAt: new Date(),
        },
      });
  }

  // --- Emekliye ayırma ------------------------------------------------------
  // Katalogdan çıkmış ama DB'de duran satırlar. SİLİNMEZ: içerik ve ilerleme bağlı.
  const orphanLessons = existingLessons.filter((l) => !wantedLessonIds.includes(l.id));
  const orphanUnits = existingUnits.filter((u) => !wantedUnitIds.includes(u.id));
  c.retired += orphanLessons.length + orphanUnits.length;
  for (const o of [...orphanLessons, ...orphanUnits]) {
    console.log(`  - ${o.id}: katalogda yok → retired`);
  }

  if (!DRY_RUN && wantedLessonIds.length) {
    await db
      .update(catalogLessons)
      .set({ status: "retired", updatedAt: new Date() })
      .where(and(eq(catalogLessons.level, level), notInArray(catalogLessons.id, wantedLessonIds)));
    await db
      .update(catalogUnits)
      .set({ status: "retired", updatedAt: new Date() })
      .where(and(eq(catalogUnits.level, level), notInArray(catalogUnits.id, wantedUnitIds)));
  }

  console.log(`  ${level}: ${spec.units.length} ünite, ${spec.lessons.length} ders işlendi`);
}

// --- Doğrulama --------------------------------------------------------------
const [totals] = await db
  .select({
    lessons: raw<number>`count(*) filter (where ${catalogLessons.status} = 'active')::int`,
    retired: raw<number>`count(*) filter (where ${catalogLessons.status} = 'retired')::int`,
  })
  .from(catalogLessons);

console.log(
  `\n  +${c.lessonsInserted} yeni · ~${c.lessonsUpdated} güncel (${c.lessonsRespecced} spec değişti) · -${c.retired} emekli`,
);
if (c.staleContents > 0) {
  console.log(`  ⚠ ${c.staleContents} üretilmiş içerik bayatladı, ilk açılışta yeniden üretilecek`);
}
console.log(`  DB: ${totals?.lessons ?? 0} aktif ders, ${totals?.retired ?? 0} emekli\n`);

await sql.end();

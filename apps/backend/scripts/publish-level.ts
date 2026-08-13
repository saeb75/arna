/**
 * YAYIN KAPISI — insan onayından SONRA koşulur.
 *
 *   set -a; source .env; set +a; npx tsx scripts/publish-level.ts --level B1
 *
 * O seviyenin `ready` çekirdek ve sahne setlerini `published` yapar.
 * Yalnızca `published` satırlar servis edilir (layers.ts) — bu script koşulmadan
 * ders açılmaz. Bilinçli sürtünme: inceleme adımı atlanamasın diye.
 */
import { and, eq, inArray } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonSceneSets } from "../src/db/schema.js";

const level = process.argv[process.argv.indexOf("--level") + 1];
if (!level || level.startsWith("--")) {
  console.error("--level zorunlu");
  process.exit(1);
}

const lessonIds = (
  await db
    .select({ id: catalogLessons.id })
    .from(catalogLessons)
    .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active")))
).map((r) => r.id);

const cores = await db
  .update(lessonCores)
  .set({ status: "published", updatedAt: new Date() })
  .where(and(inArray(lessonCores.catalogLessonId, lessonIds), eq(lessonCores.status, "ready")))
  .returning({ id: lessonCores.id });

const scenes = await db
  .update(lessonSceneSets)
  .set({ status: "published", updatedAt: new Date() })
  .where(
    and(
      inArray(lessonSceneSets.coreId, cores.map((c) => c.id)),
      eq(lessonSceneSets.status, "ready"),
    ),
  )
  .returning({ id: lessonSceneSets.id });

// Daha önce yayınlanmış çekirdeklerin ready sahneleri de yayınlansın (yeniden koşum)
const publishedCores = await db
  .select({ id: lessonCores.id })
  .from(lessonCores)
  .where(and(inArray(lessonCores.catalogLessonId, lessonIds), eq(lessonCores.status, "published")));
const lateScenes = await db
  .update(lessonSceneSets)
  .set({ status: "published", updatedAt: new Date() })
  .where(
    and(
      inArray(lessonSceneSets.coreId, publishedCores.map((c) => c.id)),
      eq(lessonSceneSets.status, "ready"),
    ),
  )
  .returning({ id: lessonSceneSets.id });

console.log(`${level}: ${cores.length} çekirdek + ${scenes.length + lateScenes.length} sahne seti yayınlandı.`);
await sql.end();

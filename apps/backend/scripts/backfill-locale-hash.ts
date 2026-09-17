/**
 * MEVCUT DİL PAKETLERİNİN `sourceHash`'İNİ YENİ FORMÜLE TAŞIR. LLM ÇAĞRISI YOK.
 *
 *   set -a; source .env; set +a; npx tsx scripts/backfill-locale-hash.ts [--dry]
 *
 * `localeSourceHash` artık başlığın yanı sıra ÇEKİRDEĞİ ve SAHNE SETİNİ de
 * hash'liyor (bkz. layers.ts). Bu geri doldurma olmadan mevcut paketlerin hepsi
 * bir anda "bayat" görünür ve ilk açılışta yeniden üretilirdi — oysa içerikleri
 * değişmedi, yalnızca formül değişti. Yani bu script saf israfı önlüyor.
 *
 * GÜVENLİ OLMASININ SEBEBİ: yeni hash o satırın ŞU ANKİ çekirdeğinden hesaplanır.
 * Paket üretildikten sonra çekirdek gerçekten değiştiyse (A1'de 6, B1'de 1 ders
 * `patch-open-rubrics` ile yamalandı) bu yamalar YALNIZCA `open_response`a
 * dokundu ve `lessonLocalePackSchema` o alanları taşımıyor — paket hâlâ doğru.
 * İleride çekirdeğin ANLATILAN kısmı değişirse hash kendiliğinden tutmayacak ve
 * paket yeniden üretilecek; korumanın amacı buydu.
 */
import { eq } from "drizzle-orm";
import { SCENE_FORMAT } from "@glotmate/contracts";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonLocales, lessonSceneSets } from "../src/db/schema.js";
import { localeSourceHash } from "../src/modules/lesson/layers.js";

const dry = process.argv.includes("--dry");

const rows = await db
  .select({
    id: lessonLocales.id,
    language: lessonLocales.language,
    oldHash: lessonLocales.sourceHash,
    status: lessonLocales.status,
    core: lessonCores.core,
    scenes: lessonSceneSets.scenes,
    title: catalogLessons.title,
    level: catalogLessons.level,
    lesson: catalogLessons.id,
  })
  .from(lessonLocales)
  .innerJoin(lessonCores, eq(lessonCores.id, lessonLocales.coreId))
  .innerJoin(lessonSceneSets, eq(lessonSceneSets.id, lessonLocales.sceneSetId))
  .innerJoin(catalogLessons, eq(catalogLessons.id, lessonCores.catalogLessonId));

let changed = 0;
let same = 0;
const byLevel: Record<string, number> = {};

for (const r of rows) {
  const next = localeSourceHash(r.title, r.core, { sceneFormat: SCENE_FORMAT, scenes: r.scenes });
  if (next === r.oldHash) {
    same++;
    continue;
  }
  byLevel[r.level] = (byLevel[r.level] ?? 0) + 1;
  changed++;
  if (!dry) {
    await db.update(lessonLocales).set({ sourceHash: next, updatedAt: new Date() }).where(eq(lessonLocales.id, r.id));
  }
}

console.log(`\n${dry ? "[KURU KOŞU] " : ""}${rows.length} paket incelendi`);
console.log(`  ${changed} paketin hash'i yeni formüle taşındı ${JSON.stringify(byLevel)}`);
console.log(`  ${same} paket zaten güncel`);
console.log(`\nHiçbir paket SİLİNMEDİ, hiçbir LLM çağrısı yapılmadı.\n`);

await sql.end();

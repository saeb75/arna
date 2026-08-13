/**
 * YAYIN HATTI — çekirdek + sahne seti üretimi (offline).
 *
 *   set -a; source .env; set +a; npx tsx scripts/generate-layers.ts --level B1 [--concurrency 3]
 *
 * Üretilenler `ready` durumunda kalır — SERVİS EDİLMEZ. Yayın ayrı adımdır:
 * `review-dump.ts` ile inceleme dökümü çıkar, insan onayından sonra
 * `publish-level.ts` ready→published çevirir. İlk kullanıcı asla yayın öncesi
 * pedagojinin deneği olmaz.
 *
 * Yeniden çalıştırılabilir: hazır/yayınlı satırlar atlanır.
 */
import { and, asc, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores } from "../src/db/schema.js";
import { generateCoreForCatalog, generateScenesForCore } from "../src/modules/lesson/layers.js";

const args = process.argv.slice(2);
const valueOf = (f: string) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const level = valueOf("--level");
const concurrency = Number(valueOf("--concurrency") ?? 3);
if (!level) {
  console.error("--level zorunlu (ör. --level B1) — yanlışlıkla tüm katalog üretilmesin");
  process.exit(1);
}

const lessons = await db
  .select({ id: catalogLessons.id, title: catalogLessons.title })
  .from(catalogLessons)
  .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active")))
  .orderBy(asc(catalogLessons.position));

console.log(`\n${level}: ${lessons.length} ders — çekirdek + sahne seti üretimi\n`);

let coreOk = 0, sceneOk = 0, failed = 0;
const t0 = Date.now();
const queue = [...lessons];

async function worker() {
  for (;;) {
    const lesson = queue.shift();
    if (!lesson) return;
    try {
      const { coreId, report } = await generateCoreForCatalog(lesson.id);
      if (report.errors.length) throw new Error(report.errors.join("; "));
      coreOk++;
      const scenes = await generateScenesForCore(coreId);
      if (scenes.report.errors.length) throw new Error(scenes.report.errors.join("; "));
      sceneOk++;
      console.log(`  ✅ ${lesson.id}  (${coreOk + failed}/${lessons.length})`);
    } catch (err) {
      failed++;
      console.log(`  ❌ ${lesson.id} — ${String(err).slice(0, 120)}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const mins = ((Date.now() - t0) / 60000).toFixed(1);
const [cost] = await sql`
  select round(sum(cost_usd)::numeric, 3) as usd from llm_calls
  where purpose in ('lesson_core','lesson_scenes') and created_at > now() - interval '2 hours'`;
console.log(`\n${coreOk} çekirdek · ${sceneOk} sahne seti · ${failed} hata · ${mins} dk · ~$${cost?.usd ?? "?"} (son 2 saat)`);
console.log(`Sıradaki adım: npx tsx scripts/review-dump.ts --level ${level}\n`);
await sql.end();

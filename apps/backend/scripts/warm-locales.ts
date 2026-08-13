/**
 * DİL PAKETİ ISITICISI — lansman dilleri için ilk-açılış beklemesini sıfırlar.
 *
 *   set -a; source .env; set +a; npx tsx scripts/warm-locales.ts --level B1 --langs tr,es [--concurrency 3]
 *
 * Yalnızca YAYINLANMIŞ çekirdek+sahne çiftleri için paket üretir; yayınsız ders
 * atlanır (yayın kapısı burada da geçerli). Var olan paketler atlanır — yeniden
 * çalıştırılabilir. Uzun kuyruk diller lazy kalır; bu script yalnız lansman
 * dilleri için koşulur.
 */
import { and, asc, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons } from "../src/db/schema.js";
import { normalizeNativeLanguage } from "../src/lib/language.js";
import {
  getOrGenerateLocale,
  getPublishedCore,
  getPublishedSceneSet,
} from "../src/modules/lesson/layers.js";
import { SCENE_FORMAT, type LessonCore, type SceneSet } from "@arna/contracts";

const args = process.argv.slice(2);
const valueOf = (f: string) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const level = valueOf("--level");
const langs = (valueOf("--langs") ?? "").split(",").map((l) => normalizeNativeLanguage(l)).filter(Boolean);
const concurrency = Number(valueOf("--concurrency") ?? 3);
if (!level || langs.length === 0) {
  console.error("--level ve --langs zorunlu (ör. --level B1 --langs tr,es)");
  process.exit(1);
}

const lessons = await db
  .select()
  .from(catalogLessons)
  .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active")))
  .orderBy(asc(catalogLessons.position));

interface Job { lessonId: string; lang: string }
const jobs: Job[] = [];
for (const lesson of lessons) for (const lang of langs) jobs.push({ lessonId: lesson.id, lang });

console.log(`\n${level} × [${langs.join(", ")}] — ${jobs.length} paket hedefi\n`);

let ok = 0, skipped = 0, failed = 0;
const t0 = Date.now();
const queue = [...jobs];

async function worker() {
  for (;;) {
    const job = queue.shift();
    if (!job) return;
    const lesson = lessons.find((l) => l.id === job.lessonId)!;
    try {
      const coreRow = await getPublishedCore(lesson.id, lesson.specHash);
      if (!coreRow?.core) {
        skipped++;
        continue; // yayınsız — yayın kapısı burada da geçerli
      }
      const sceneRow = await getPublishedSceneSet(coreRow.id);
      if (!sceneRow?.scenes) {
        skipped++;
        continue;
      }
      await getOrGenerateLocale({
        core: coreRow.core as LessonCore,
        coreId: coreRow.id,
        sceneSet: { sceneFormat: SCENE_FORMAT, scenes: sceneRow.scenes } as SceneSet,
        sceneSetId: sceneRow.id,
        language: job.lang,
        cefrLevel: lesson.level,
        titleEn: lesson.title,
        themeHint: lesson.themeHint,
        userId: null,
      });
      ok++;
      if (ok % 10 === 0) console.log(`  ${ok}/${jobs.length}…`);
    } catch (err) {
      failed++;
      console.log(`  ❌ ${job.lessonId} [${job.lang}] — ${String(err).slice(0, 100)}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const mins = ((Date.now() - t0) / 60000).toFixed(1);
const [cost] = await sql`
  select round(sum(cost_usd)::numeric, 3) as usd from llm_calls
  where purpose = 'lesson_locale' and created_at > now() - interval '2 hours'`;
console.log(`\n${ok} paket üretildi · ${skipped} atlandı (yayınsız/var) · ${failed} hata · ${mins} dk · ~$${cost?.usd ?? "?"}\n`);
await sql.end();

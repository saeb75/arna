/**
 * DİKEY DİLİM — Faz A5'in üretim yarısı.
 *
 *   set -a; source .env; set +a; npx tsx scripts/slice-generate.ts
 *
 * 3 ders (A1 grammar · B1 phrases · C1 practice) için:
 *   çekirdek üret → yayınla → sahne seti üret → yayınla → tr + ar + zh-hans
 *   dil paketleri üret → tr için birleşik dersi (native + english) montajla, bas.
 *
 * AMAÇ: üç prompt'un ve üç lint'in GERÇEK çıktıda tuttuğunu, şema donmadan
 * görmek. Bu geçmeden 371 üretimine GEÇİLMEZ — şema burada değişirse 3 dersi
 * yeniden üretmek bedava, 371'i değil.
 */
import { assembleLesson, type LessonCore, type SceneSet } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonCores, lessonSceneSets, catalogLessons } from "../src/db/schema.js";
import { getChrome } from "../src/i18n/index.js";
import {
  generateCoreForCatalog,
  generateScenesForCore,
  getOrGenerateLocale,
} from "../src/modules/lesson/layers.js";

const SLICE = [
  "a1-she-works-at-night", // A1 grammar
  "b1-suddenly-meanwhile-later", // B1 phrases
  "c1-defending-under-pressure", // C1 practice
];
const LANGS = ["tr", "ar", "zh-hans"];

const check = (label: string, ok: boolean, detail = "") =>
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);

for (const lessonId of SLICE) {
  console.log(`\n═══ ${lessonId} ═══`);
  const [cat] = await db.select().from(catalogLessons).where(eq(catalogLessons.id, lessonId));
  if (!cat) {
    check(lessonId, false, "katalogda yok");
    continue;
  }

  // 1) Çekirdek
  const t0 = Date.now();
  const { coreId, report } = await generateCoreForCatalog(lessonId);
  check(`çekirdek üretildi (${((Date.now() - t0) / 1000).toFixed(1)} sn)`, report.errors.length === 0, report.errors.join("; "));
  await db.update(lessonCores).set({ status: "published" }).where(eq(lessonCores.id, coreId));

  const [coreRow] = await db.select().from(lessonCores).where(eq(lessonCores.id, coreId));
  const core = coreRow!.core as LessonCore;

  // Örnek iddialar — insan incelemesinin okuyacağı yüzey
  const firstTeach = core.lecture.beats.find((b) => b.kind === "teach");
  if (firstTeach?.kind === "teach") {
    console.log(`   iddialar (${firstTeach.points.length} nokta):`);
    for (const p of firstTeach.points) {
      for (const c of p.claimsEn) console.log(`     • ${c}`);
      for (const ex of p.examples) console.log(`       [${ex.id}] ${ex.textEn}`);
    }
  }

  // 2) Sahne seti (tek çağrıda 5)
  const t1 = Date.now();
  const scenes = await generateScenesForCore(coreId);
  check(`sahne seti üretildi (${((Date.now() - t1) / 1000).toFixed(1)} sn)`, scenes.report.errors.length === 0, scenes.report.errors.join("; "));
  await db.update(lessonSceneSets).set({ status: "published" }).where(eq(lessonSceneSets.id, scenes.sceneSetId));

  const [sceneRow] = await db.select().from(lessonSceneSets).where(eq(lessonSceneSets.id, scenes.sceneSetId));
  const sceneSet = { sceneFormat: 1, scenes: sceneRow!.scenes } as SceneSet;
  for (const [track, s] of Object.entries(sceneSet.scenes)) {
    console.log(`   ${track.padEnd(9)} ${s.persona.name.padEnd(8)} ${s.scene.slice(0, 70)}`);
  }

  // 3) Dil paketleri
  for (const lang of LANGS) {
    const t2 = Date.now();
    try {
      const { pack } = await getOrGenerateLocale({
        core,
        coreId,
        sceneSet,
        sceneSetId: scenes.sceneSetId,
        language: lang,
        cefrLevel: cat.level,
        titleEn: cat.title,
        themeHint: cat.themeHint,
        userId: null,
      });
      check(`dil paketi ${lang} (${((Date.now() - t2) / 1000).toFixed(1)} sn)`, true, pack.title);
    } catch (err) {
      check(`dil paketi ${lang}`, false, String(err).slice(0, 140));
    }
  }

  // 4) Montaj kanıtı — tr native + english modları
  const [trLocale] = await sql`
    select id, pack from lesson_locales where core_id = ${coreId} and language = 'tr' and status = 'ready' limit 1`;
  if (trLocale) {
    const native = assembleLesson({
      core,
      scene: sceneSet.scenes.everyday!,
      track: "everyday",
      pack: trLocale.pack as never,
      chrome: getChrome("tr"),
      nativeLanguage: "tr",
      titleEn: cat.title,
    });
    const english = assembleLesson({
      core,
      scene: sceneSet.scenes.everyday!,
      track: "everyday",
      pack: null,
      chrome: getChrome("en"),
      nativeLanguage: "tr",
      titleEn: cat.title,
    });

    const teach = native.lecture.beats.find((b) => b.kind === "teach");
    if (teach?.kind === "teach") {
      console.log(`   NATIVE anlatım (runs):`);
      for (const run of teach.points[0]!.runs) {
        console.log(`     [${run.lang}${run.emphasis ? "·vurgu" : ""}] ${run.text}`);
      }
    }
    const ex = native.lecture.beats.find((b) => b.kind === "exercise");
    if (ex?.kind === "exercise") {
      console.log(`   NATIVE alıştırma: ${ex.runs.map((r) => `[${r.lang}]${r.text}`).join(" ")}`);
      if (ex.options) console.log(`     şıklar: ${ex.options.join(" | ")}`);
    }
    check("english modda hiç l1 parçası yok", JSON.stringify(english.lecture.beats).indexOf('"l1"') === -1);
    check("native modda başlık Türkçe", native.title !== native.titleEn, `"${native.title}"`);
  }
}

// Özet maliyet
const [cost] = await sql`
  select purpose, count(*)::int as n, round(sum(cost_usd)::numeric, 4) as usd, round(avg(latency_ms))::int as ms
  from llm_calls where purpose in ('lesson_core','lesson_scenes','lesson_locale')
  group by purpose order by purpose`;
void cost;
const rows = await sql`
  select purpose, count(*)::int as n, round(sum(cost_usd)::numeric, 4) as usd, round(avg(latency_ms))::int as avg_ms
  from llm_calls where purpose in ('lesson_core','lesson_scenes','lesson_locale')
  group by purpose order by purpose`;
console.log("\nMALİYET:");
for (const r of rows) console.log(`  ${String(r.purpose).padEnd(14)} ${String(r.n).padStart(3)} çağrı · $${r.usd} · ort ${r.avg_ms} ms`);

await sql.end();

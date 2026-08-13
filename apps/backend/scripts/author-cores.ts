/**
 * ELLE YAZILMIŞ ÇEKİRDEKLERİ DB'YE YAZAR — LLM ÇAĞRISI YOK.
 *
 *   set -a; source .env; set +a; npx tsx scripts/author-cores.ts --level A1 [--dry]
 *
 * `scripts/authored/<level>.ts` içindeki dersleri şema + lintCore + lintScenes
 * kapılarından geçirip `status='ready'` olarak yazar. Yayın AYRI adımdır
 * (publish-level.ts) — insan incelemesi atlanamasın diye.
 *
 * Anahtar hizası: satırlar `getPublishedCore`in aradığı anahtarla yazılır
 * (catalogLessonId + coreFormat + promptVersion + specHash). promptVersion elle
 * yazımda da lesson-core.v1'dir: sunum anahtarı üretim yöntemini değil FORMATI
 * tanımlar; başka bir değer yazsak servis satırı bulamazdı.
 */
import { and, eq, inArray, notInArray, sql as raw } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonLocales, lessonSceneSets } from "../src/db/schema.js";
import { lessonCoreSchema, sceneSetSchema } from "@arna/contracts";
import { lintCore, lintScenes } from "../src/modules/lesson/lintLayers.js";
import { LESSON_CORE_VERSION } from "../src/modules/llm/prompts/lesson-core.v1.js";
import { LESSON_SCENES_VERSION } from "../src/modules/llm/prompts/lesson-scenes.v1.js";
import { buildCore, buildScenes, type Authored } from "./authored/dsl.js";
import { CORE_FORMAT, SCENE_FORMAT } from "@arna/contracts";

const args = process.argv.slice(2);
const level = args[args.indexOf("--level") + 1];
const dry = args.includes("--dry");
/**
 * Yayınlı çekirdeği elle yazılanla DEĞİŞTİR. Varsayılan olarak kapalıdır: yayın
 * kapısını ve dil paketlerini kazara ezmemek için. Açıldığında satır 'ready'ye
 * döner (yeniden inceleme + yayın gerekir) ve o çekirdeğin dil paketleri SİLİNİR
 * — paketler eski iddiaları anlatıyordu, çekirdek değişince yalan söylerler.
 */
const forcePublished = args.includes("--replace-published");
if (!level || level.startsWith("--")) {
  console.error("--level zorunlu (ör. --level A1)");
  process.exit(1);
}

const mod = (await import(`./authored/${level.toLowerCase()}.js`)) as { LESSONS: Authored[] };
const authored = mod.LESSONS;

const rows = await db
  .select()
  .from(catalogLessons)
  .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active")));
const byId = new Map(rows.map((r) => [r.id, r]));

console.log(`\n${level}: ${authored.length} elle yazılmış ders · katalogda ${rows.length} ders\n`);

const missing = authored.filter((a) => !byId.has(a.id)).map((a) => a.id);
if (missing.length) throw new Error(`katalogda olmayan kimlikler: ${missing.join(", ")}`);
const dupes = authored.map((a) => a.id).filter((id, i, arr) => arr.indexOf(id) !== i);
if (dupes.length) throw new Error(`yazımda tekrar eden kimlik: ${dupes.join(", ")}`);

let written = 0;
const allWarnings: string[] = [];

for (const a of authored) {
  const cat = byId.get(a.id)!;
  const core = lessonCoreSchema.parse(
    buildCore(a, { focus: cat.focus, mustUse: cat.targetPhrases as string[] }),
  );
  const scenes = sceneSetSchema.parse(buildScenes(a));

  const coreReport = lintCore(core, { forbidden: [] });
  if (coreReport.errors.length) throw new Error(`${a.id} lintCore:\n  - ${coreReport.errors.join("\n  - ")}`);
  const sceneReport = lintScenes(scenes, { forbidden: [] });
  if (sceneReport.errors.length) throw new Error(`${a.id} lintScenes:\n  - ${sceneReport.errors.join("\n  - ")}`);
  for (const w of [...coreReport.warnings, ...sceneReport.warnings]) allWarnings.push(`${a.id}: ${w}`);

  if (dry) continue;

  const [coreRow] = await db
    .insert(lessonCores)
    .values({
      catalogLessonId: a.id,
      coreFormat: CORE_FORMAT,
      promptVersion: LESSON_CORE_VERSION,
      specHash: cat.specHash,
      status: "ready",
      core,
      model: "authored/claude",
    })
    .onConflictDoUpdate({
      target: [lessonCores.catalogLessonId, lessonCores.coreFormat, lessonCores.promptVersion, lessonCores.specHash],
      // YAYINLI satır elle yazımla EZİLMEZ (yayın kapısı + dil paketleri ona bağlı);
      // --replace-published bunu bilinçli olarak açar.
      set: { core, status: "ready", model: "authored/claude", updatedAt: new Date() },
      ...(forcePublished ? {} : { setWhere: eq(lessonCores.status, "ready") }),
    })
    .returning();

  if (!coreRow) {
    console.log(`  ⏭ ${a.id}: yayınlanmış çekirdek korunuyor (--replace-published ile değiştirilir)`);
    continue;
  }

  if (forcePublished) {
    const gone = await db
      .delete(lessonLocales)
      .where(eq(lessonLocales.coreId, coreRow.id))
      .returning({ language: lessonLocales.language });
    if (gone.length) console.log(`  ♻ ${a.id}: ${gone.length} dil paketi silindi (${gone.map((g) => g.language).join(", ")})`);
  }

  await db
    .insert(lessonSceneSets)
    .values({
      coreId: coreRow.id,
      sceneFormat: SCENE_FORMAT,
      promptVersion: LESSON_SCENES_VERSION,
      status: "ready",
      scenes: scenes.scenes,
      model: "authored/claude",
    })
    .onConflictDoUpdate({
      target: [lessonSceneSets.coreId, lessonSceneSets.sceneFormat, lessonSceneSets.promptVersion],
      set: { scenes: scenes.scenes, status: "ready", model: "authored/claude", updatedAt: new Date() },
      setWhere: eq(lessonSceneSets.status, "ready"),
    });

  written++;
}

// --- Bayat satır temizliği ---------------------------------------------------
// Katalogdaki `targetPhrases`/`focus` değişince `specHash` değişir ve upsert YENİ
// bir satır doğurur; eskisi 'ready' olarak kalıp incelemeyi ve yayını kirletir
// (servis yolu zaten yalnız güncel hash'i arar, yani sessiz ölü veri). Yayınsız ve
// paketsiz olanları siliyoruz — yayınlı ya da paketli satıra DOKUNMUYORUZ, çünkü
// eski oturumlar onlara bağlı olabilir.
if (!dry) {
  const stale = await db
    .select({ id: lessonCores.id, lesson: lessonCores.catalogLessonId })
    .from(lessonCores)
    .where(
      and(
        inArray(lessonCores.catalogLessonId, rows.map((r) => r.id)),
        eq(lessonCores.status, "ready"),
        notInArray(lessonCores.specHash, rows.map((r) => r.specHash)),
      ),
    );
  const deletable: string[] = [];
  for (const s of stale) {
    const [{ n }] = await db
      .select({ n: raw<number>`count(*)::int` })
      .from(lessonLocales)
      .where(eq(lessonLocales.coreId, s.id));
    if ((n ?? 0) === 0) deletable.push(s.id);
  }
  if (deletable.length) {
    await db.delete(lessonCores).where(inArray(lessonCores.id, deletable));
    console.log(`\n🧹 ${deletable.length} bayat çekirdek satırı silindi (katalog spec'i değişmişti)`);
  }
}

if (allWarnings.length) {
  console.log(`UYARILAR (${allWarnings.length}):`);
  for (const w of allWarnings) console.log(`  ⚠ ${w}`);
  console.log();
}

const done = new Set(authored.map((a) => a.id));
const remaining = rows.filter((r) => !done.has(r.id));
console.log(`${dry ? "[KURU KOŞU] " : ""}${written}/${authored.length} ders yazıldı · ${remaining.length} ders henüz yazılmadı`);
if (remaining.length) console.log(`  eksikler: ${remaining.map((r) => r.id).join(", ")}`);

if (!dry) {
  const ready = await db
    .select({ id: lessonCores.id })
    .from(lessonCores)
    .where(and(inArray(lessonCores.catalogLessonId, rows.map((r) => r.id)), eq(lessonCores.status, "ready")));
  console.log(`\nDB: ${level} için ${ready.length} 'ready' çekirdek. İnceleme: npx tsx scripts/review-dump.ts --level ${level}\n`);
}

await sql.end();

/**
 * Katalog örneklemesi — seçilen katalog satırlarından GERÇEKTEN içerik üretir ve
 * lint'ten ilk denemede geçip geçmediğine bakar.
 *
 *   set -a; source .env; set +a; npx tsx scripts/test-catalog-sample.ts [id ...]
 *
 * Lint katalogu biçim olarak denetler; bu script katalogun ÜRETİLEBİLİR olduğunu
 * denetler. Yeni bir seviye yazıldığında koşulmalı — özellikle `kind: practice`
 * satırları için, çünkü orada `focus` bir gramer yapısı değil bir iletişim
 * becerisidir ve prompt'un o tipe ayrı yönergesi var.
 *
 * Satır başına bir LLM çağrısı (~$0.014).
 */
import { lessonContentSchema } from "@arna/contracts";
import { inArray } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons } from "../src/db/schema.js";
import { completeJson } from "../src/modules/llm/index.js";
import { buildLessonGenPrompt, LESSON_GEN_VERSION } from "../src/modules/llm/prompts/lesson-gen.v8.js";
import { lintLesson } from "../src/modules/lesson/lint.js";

const DEFAULT_IDS = [
  "b1-he-said-he-was-tired",
  "b2-having-finished-she-left",
  "c1-defending-under-pressure",
  "c2-just-talking",
];

const ids = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_IDS;
const rows = await db.select().from(catalogLessons).where(inArray(catalogLessons.id, ids));

if (rows.length !== ids.length) {
  const found = new Set(rows.map((r) => r.id));
  console.error(`Bulunamayan kimlik: ${ids.filter((i) => !found.has(i)).join(", ")}`);
  await sql.end();
  process.exit(1);
}

let clean = 0;
let failed = 0;

for (const l of rows) {
  const { system, user } = buildLessonGenPrompt({
    nativeLanguage: "tr",
    cefrLevel: l.level,
    track: "conversation",
    lesson: {
      kind: l.kind as "phrases" | "grammar" | "practice",
      title: l.title,
      focus: l.focus,
      themeHint: l.themeHint,
      targetPhrases: l.targetPhrases,
    },
  });

  const t0 = Date.now();
  try {
    const content = await completeJson({
      purpose: "lesson_gen",
      system,
      user,
      schema: lessonContentSchema,
      promptVersion: LESSON_GEN_VERSION,
      maxTokens: 2500,
      temperature: 0.4,
    });
    // mustUse kodda dayatılır — servisteki davranışın aynısı
    content.practice.mustUse = [...l.targetPhrases];
    const report = lintLesson(content, { forbidden: ["Saeb"] });

    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (report.errors.length === 0) {
      clean++;
      console.log(`✅ ${l.id} (${l.level}/${l.kind}) ${secs} sn`);
      console.log(`   başlık: ${content.title}`);
      console.log(`   sahne : ${content.practice.scenario}`);
      console.log(`   madde : ${content.lecture.beats.find((b) => b.kind === "teach")?.kind === "teach" ? "var" : "YOK"} · alıştırma: ${content.lecture.beats.filter((b) => b.kind === "exercise").length} · roleplay turu: ${content.practice.maxTurns}`);
    } else {
      failed++;
      console.log(`❌ ${l.id} (${l.level}/${l.kind}) — ${report.errors.join(" | ")}`);
      // Hatanın hangi satırdan geldiğini görmeden düzeltme tahmine dayanır
      for (const b of content.lecture.beats) {
        if (b.kind !== "exercise") continue;
        console.log(`   [${b.id}] prompt : ${b.prompt}`);
        if (b.options) console.log(`   [${b.id}] options: ${JSON.stringify(b.options)}`);
        console.log(`   [${b.id}] answers: ${JSON.stringify(b.answers)}`);
      }
    }
  } catch (err) {
    failed++;
    console.log(`💥 ${l.id} (${l.level}/${l.kind}) şema hatası: ${String(err).slice(0, 160)}`);
  }
}

console.log(`\nilk denemede temiz: ${clean}/${rows.length}${failed ? ` · başarısız: ${failed}` : ""}\n`);
await sql.end();

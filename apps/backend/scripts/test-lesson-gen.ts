/** Faz 6 doğrulama: yeni ders şekli (Lecture beats + Practice + quiz) üretimi.
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-lesson-gen.ts` */
import { desc } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { llmCalls, userProfiles } from "../src/db/schema.js";
import { getOrGenerateLesson } from "../src/modules/lesson/service.js";

const testUserId = "00000000-0000-4000-8000-000000000002";
const nativeLanguage = process.env.NATIVE ?? "tr";

// Yarım kalmış bir koşudan artık kalmış olabilir — diğer script'lerdeki desen
await sql`delete from user_profiles where user_id = ${testUserId}`;

await db.insert(userProfiles).values({
  userId: testUserId,
  displayName: "Saeb",
  nativeLanguage,
  cefrLevel: "A2",
  track: "work",
  dailyGoalMinutes: 10,
  occupation: "front-end developer / takım lideri",
  interests: ["technology", "gaming"],
});
import { seedTestCatalogLesson } from "./_fixture.js";
const row = await seedTestCatalogLesson({});

const t0 = Date.now();
const { content, report } = await getOrGenerateLesson(testUserId, row.id);
console.log(`üretim: ${((Date.now() - t0) / 1000).toFixed(1)} sn | konu: ${content.topic} | ~${content.estMinutes} dk\n`);

console.log("hedefler:");
for (const o of content.objectives) console.log(`  • ${o}`);
console.log(`iletişim amacı: ${content.communicationGoal}`);
console.log(`tutorNotes.target: ${content.tutorNotes.target}`);
console.log(`tutorNotes.commonErrors: ${content.tutorNotes.commonErrors.join(" | ")}\n`);

console.log("=== LECTURE (" + content.lecture.beats.length + " beat) ===");
console.log("(niyetler — birebir cümle DEĞİL; hocanın repliği oturum açılışında üretilir)");
for (const b of content.lecture.beats) {
  if (b.kind === "teach") {
    console.log(`  [teach] niyet: ${b.introIntent}`);
    for (const p of b.points) console.log(`          • ${p}`);
  } else if (b.kind === "exercise") {
    console.log(`  [exercise] ${b.prompt}`);
    if (b.options) console.log(`             şıklar: ${b.options.join(" / ")}`);
    console.log(`             cevap: ${b.answers.join(" | ")} · ipucu: ${b.hint}`);
  } else if (b.kind === "ask") {
    console.log(`  [ask/${b.purpose}] niyet: ${b.intent}`);
  } else if (b.kind === "open_response") {
    console.log(`  [open_response] ${b.prompt}`);
    console.log(`             rubrik: ${b.rubric.criteria}`);
    console.log(`             ipucu: ${b.hint} · ${b.maxAttempts} deneme`);
  } else {
    console.log(`  [say] niyet: ${b.intent}`);
  }
}

const p = content.practice;
console.log("\n=== PRACTICE ===");
console.log(`  giriş niyeti: ${p.introIntent}`);
console.log(`  persona: ${p.persona.name} (${p.persona.role}) · amacı: ${p.persona.goal}`);
console.log(`  sahne: ${p.scenario}`);
console.log(`  hedef: ${p.userGoal}`);
console.log(`  açılış: ${p.avatarOpening}`);
console.log(`  kullandırılacak: ${p.mustUse.join(", ")} · ${p.minTargetUses}x · ${p.maxTurns} tur`);
console.log(`  başarı ölçütü: ${p.successCriteria}`);

// v6'nın en kritik güvencesi: içerik kullanıcıdan BAĞIMSIZ olmalı
const leaked = JSON.stringify(content).toLowerCase().includes("saeb");
console.log(`\nisim sızıntısı: ${leaked ? "❌ içerikte 'Saeb' geçiyor" : "✅ içerikte öğrenci adı yok"}`);

console.log("\n=== QUIZ (" + (content.quiz?.length ?? 0) + ") ===");
for (const q of content.quiz ?? []) {
  if (q.type === "mcq") console.log(`  [mcq] ${q.stem} → ${q.options[q.correctIndex]}`);
  else console.log(`  [fill] ${q.text} → ${q.answers.map((a) => a[0]).join(", ")}`);
}
console.log("\nözet:", content.summary);
if (report.warnings.length) console.log("uyarılar:", report.warnings.join("; "));

const t1 = Date.now();
await getOrGenerateLesson(testUserId, row.id);
console.log("cache:", Date.now() - t1, "ms");

const [call] = await db.select().from(llmCalls).orderBy(desc(llmCalls.id)).limit(1);
console.log("maliyet: $" + call!.costUsd);

await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql.end();

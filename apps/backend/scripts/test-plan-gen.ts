/** Faz 2 doğrulama script'i: gerçek OpenAI çağrısıyla plan üretimi + DB kontrol + temizlik.
 *  Çalıştırma: apps/backend içinde `set -a; source .env; set +a; npx tsx scripts/test-plan-gen.ts` */
import { desc } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { llmCalls } from "../src/db/schema.js";
import { createProgramForUser } from "../src/modules/onboarding/service.js";

const testUserId = "00000000-0000-4000-8000-000000000001";

const t0 = Date.now();
const program = await createProgramForUser(testUserId, {
  displayName: "Saeb",
  nativeLanguage: "tr",
  dailyGoalMinutes: 10,
  track: "business",
  cefrLevel: "A2",
  interests: ["technology", "gaming", "finance"],
  occupation: "front-end developer / takım lideri",
});

console.log("süre:", ((Date.now() - t0) / 1000).toFixed(1), "sn");
// Faz 6'da ünite yapısı kalktı — plan artık düz, sıralı bir konu yolu
console.log("ders sayısı:", program.lessons.length, "| durum:", program.status);
console.log("--- ilk 6 ders:");
for (const l of program.lessons.slice(0, 6))
  console.log(`  ${l.position}. ${l.title} | odak: ${l.focus}`);
console.log("--- ortadan 3 ders:");
for (const l of program.lessons.slice(21, 24))
  console.log(`  ${l.position}. ${l.title} | odak: ${l.focus} | tema: ${l.theme}`);

const [call] = await db.select().from(llmCalls).orderBy(desc(llmCalls.id)).limit(1);
console.log(
  "--- llm_calls:", call!.model,
  "| in:", call!.inputTokens, "out:", call!.outputTokens,
  "| maliyet: $" + call!.costUsd, "| gecikme:", call!.latencyMs + "ms",
);

await sql`delete from programs where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;
console.log("test verisi temizlendi");
await sql.end();

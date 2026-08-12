/** Yardımcı: takılan test verisini temizler + son LLM hatalarını gösterir. */
import { desc } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { llmCalls } from "../src/db/schema.js";
import { cleanupTestUser } from "./_fixture.js";

const failed = await sql`
  select status, validation_report from lesson_contents where status = 'failed' order by created_at desc limit 3`;
for (const row of failed) console.log("failed:", JSON.stringify(row.validation_report).slice(0, 300));

const calls = await db.select().from(llmCalls).orderBy(desc(llmCalls.id)).limit(3);
for (const c of calls) console.log(`llm: ${c.purpose} ${c.model} $${c.costUsd} ${c.latencyMs}ms`);

// Test kullanıcılarını temizle. Katalog satırları ve üretilmiş içerik PAYLAŞIMLI
// olduğu için silinmez — kullanıcıya ait olan yalnızca ilerleme ve oturumlar.
for (let i = 1; i <= 9; i++) {
  await cleanupTestUser(`00000000-0000-4000-8000-00000000000${i}`);
}
console.log("test verileri temizlendi");
await sql.end();

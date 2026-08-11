/** Yardımcı: takılan test verisini temizler + son LLM hatalarını gösterir. */
import { desc } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { llmCalls } from "../src/db/schema.js";

const failed = await sql`
  select status, validation_report from lessons where status = 'failed' order by created_at desc limit 3`;
for (const row of failed) console.log("failed:", JSON.stringify(row.validation_report).slice(0, 300));

const calls = await db.select().from(llmCalls).orderBy(desc(llmCalls.id)).limit(3);
for (const c of calls) console.log(`llm: ${c.purpose} ${c.model} $${c.costUsd} ${c.latencyMs}ms`);

// test kullanıcılarını temizle
for (const uid of [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
  "00000000-0000-4000-8000-000000000004",
  "00000000-0000-4000-8000-000000000005",
]) {
  await sql`delete from programs where user_id = ${uid}`;
  await sql`delete from user_profiles where user_id = ${uid}`;
}
console.log("test verileri temizlendi");
await sql.end();

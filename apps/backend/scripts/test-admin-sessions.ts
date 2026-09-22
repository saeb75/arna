/**
 * Admin oturum listesi/detayı — gerçek DB, SALT OKUNUR; şema + gizlilik sınırı.
 *   set -a; source .env; set +a; npx tsx scripts/test-admin-sessions.ts
 */
import assert from "node:assert/strict";
import { adminSessionDetailSchema, adminSessionsResponseSchema } from "@glotmate/contracts";
import { sql } from "../src/db/client.js";
import { getAdminSessionDetail, getAdminSessions } from "../src/modules/admin/sessions.js";

const t0 = Date.now();
const list = adminSessionsResponseSchema.parse(await getAdminSessions({ limit: 200 }));
console.log(`${list.sessions.length}/${list.total} oturum, ${Date.now() - t0} ms`);

// En yeni önce
for (let i = 1; i < list.sessions.length; i++) {
  assert.ok(list.sessions[i - 1]!.startedAt >= list.sessions[i]!.startedAt, "startedAt desc");
}

const busiest = [...list.sessions].sort((a, b) => b.turnCount - a.turnCount)[0];
if (busiest) {
  const t1 = Date.now();
  const raw = await getAdminSessionDetail(busiest.id);
  const d = adminSessionDetailSchema.parse(raw);
  console.log(
    `detay ${busiest.userEmail} · ${busiest.lessonTitle ?? busiest.roleplayId}: ${Date.now() - t1} ms — ` +
      `${d.turns.length} tur (${d.turns.filter((t) => t.source === "script").length} script), ${d.llmCalls.length} LLM, ` +
      `phase=${d.position?.phase ?? "-"} hits=${d.practiceHitTurns.length} summary=${!!d.summary}`,
  );
  assert.equal(d.turns.length, busiest.turnCount, "tur sayısı liste ile tutarlı");
  for (let i = 1; i < d.turns.length; i++) assert.ok(d.turns[i - 1]!.id < d.turns[i]!.id, "turlar id artan");

  // GİZLİLİK: prompt malzemesi ve embedding hiçbir anahtar olarak yok
  const blob = JSON.stringify(raw);
  for (const key of ['"memoryBlock"', '"script":', '"embedding":', '"state":']) {
    assert.ok(!blob.includes(key), `${key} sızdı`);
  }
  if (d.summary) {
    const n = Array.isArray(d.summary.errorsObserved) ? d.summary.errorsObserved.length : 0;
    assert.equal(d.session.errorCount, n, "errorCount = errors_observed uzunluğu");
  }
}

await assert.rejects(() => getAdminSessionDetail("00000000-0000-0000-0000-000000000000"), /not_found/);
console.log("\n✅ admin sessions: tüm vakalar geçti");
await sql.end();

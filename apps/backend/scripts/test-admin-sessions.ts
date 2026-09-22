/**
 * Admin oturum listesi/detayı — gerçek DB, SALT OKUNUR; şema + gizlilik sınırı.
 *   set -a; source .env; set +a; npx tsx scripts/test-admin-sessions.ts
 */
import assert from "node:assert/strict";
import { adminSessionDetailSchema, adminSessionsQuerySchema, adminSessionsResponseSchema } from "@glotmate/contracts";
import { sql } from "../src/db/client.js";
import { getAdminSessionDetail, getAdminSessions } from "../src/modules/admin/sessions.js";

// Query-string boolean çözümü: "false" KAPALI, "true"/"1" AÇIK, yoksa kapalı
assert.equal(adminSessionsQuerySchema.parse({ onlyErrors: "false" }).onlyErrors, false, '"false" → false');
assert.equal(adminSessionsQuerySchema.parse({ onlyErrors: "true" }).onlyErrors, true);
assert.equal(adminSessionsQuerySchema.parse({ onlyChat: "1" }).onlyChat, true);
assert.equal(adminSessionsQuerySchema.parse({}).onlyErrors, false);

const t0 = Date.now();
const Q = { page: 1, pageSize: 25, sort: "newest" as const, q: "", kind: "all" as const, status: "all" as const, level: "all" as const, onlyErrors: false, onlyChat: false };
const list = adminSessionsResponseSchema.parse(await getAdminSessions(Q));
console.log(`sayfa 1: ${list.sessions.length}/${list.total} oturum (stats total ${list.stats.total}), ${Date.now() - t0} ms`);
assert.ok(list.sessions.length <= 25 && list.total === list.stats.total, "süzgeçsiz toplam = stats toplamı");

// Sayfa 2 farklı satırlar döner; sunucu süzgeçleri anlamlı
const page2 = adminSessionsResponseSchema.parse(await getAdminSessions({ ...Q, page: 2 }));
assert.ok(!page2.sessions.some((s) => list.sessions.some((t) => t.id === s.id)), "sayfa 2 sayfa 1 ile kesişmez");
const ended = adminSessionsResponseSchema.parse(await getAdminSessions({ ...Q, status: "ended" }));
assert.ok(ended.sessions.every((s) => s.endedAt !== null) && ended.total <= list.total, "status=ended");
const chatty = adminSessionsResponseSchema.parse(await getAdminSessions({ ...Q, onlyChat: true, sort: "longest" }));
assert.ok(chatty.sessions.every((s) => s.chatTurnCount > 0), "onlyChat");
for (let i = 1; i < chatty.sessions.length; i++) assert.ok(chatty.sessions[i - 1]!.turnCount >= chatty.sessions[i]!.turnCount, "longest desc");
const searched = adminSessionsResponseSchema.parse(await getAdminSessions({ ...Q, q: "saebdev" }));
assert.ok(searched.sessions.every((s) => s.userEmail?.includes("saebdev")), "q e-posta");
const errs = adminSessionsResponseSchema.parse(await getAdminSessions({ ...Q, onlyErrors: true }));
assert.ok(errs.sessions.every((s) => s.errorCount > 0) && errs.total === list.stats.withErrors, "onlyErrors = stats.withErrors");

// En yeni önce
for (let i = 1; i < list.sessions.length; i++) {
  assert.ok(list.sessions[i - 1]!.startedAt >= list.sessions[i]!.startedAt, "startedAt desc");
}

const busiest = chatty.sessions[0];
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

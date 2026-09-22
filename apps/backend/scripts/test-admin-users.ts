/**
 * Admin kullanıcı listesi/detayı — gerçek DB'ye karşı, SALT OKUNUR; contracts
 * şemasından geçirir ve gizlilik sınırını denetler (state/transkript/embedding yok).
 *   set -a; source .env; set +a; npx tsx scripts/test-admin-users.ts
 */
import assert from "node:assert/strict";
import { adminUserDetailSchema, adminUsersResponseSchema } from "@glotmate/contracts";
import { sql } from "../src/db/client.js";
import { getAdminUserDetail, getAdminUsers } from "../src/modules/admin/users.js";

const t0 = Date.now();
const list = adminUsersResponseSchema.parse(await getAdminUsers());
console.log(`${list.users.length} kullanıcı, ${Date.now() - t0} ms`);
for (const u of list.users) {
  console.log(
    `  ${u.email ?? "(no email)"}  admin=${u.isAdmin} profile=${u.hasProfile} ${u.cefrLevel ?? "-"}/${u.track ?? "-"} ` +
      `lessons ${u.lessonsCompleted}✓/${u.lessonsInProgress}… sessions ${u.sessionCount} $${u.llmCostUsd.toFixed(3)}`,
  );
}

if (list.users.length) {
  const target = list.users.find((u) => u.sessionCount > 0) ?? list.users[0]!;
  const t1 = Date.now();
  const raw = await getAdminUserDetail(target.id);
  const detail = adminUserDetailSchema.parse(raw);
  console.log(`\ndetay ${target.email}: ${Date.now() - t1} ms — ${detail.progress.length} ders, ${detail.sessions.length} oturum, ${detail.memories.length} hafıza, ${detail.checkpoints.length} test, $${detail.cost.totalUsd.toFixed(3)}`);

  // Gizlilik sınırı: yasak alanlar cevapta HİÇ yok
  const blob = JSON.stringify(raw);
  for (const forbidden of ['"state":', '"position":', '"embedding":', '"transcript']) {
    assert.ok(!blob.includes(forbidden), `${forbidden} sızdı`);
  }
  assert.ok(detail.sessions.length <= 20 && detail.memories.length <= 30, "limitler");
  assert.equal(detail.user.id, target.id);
}

await assert.rejects(() => getAdminUserDetail("00000000-0000-0000-0000-000000000000"), /not_found/, "yok → not_found");

console.log("\n✅ admin users: tüm vakalar geçti");
await sql.end();

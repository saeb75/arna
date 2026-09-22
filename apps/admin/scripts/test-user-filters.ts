/**
 * Kullanıcı süzme/özet yardımcılarının doğruluk tablosu — LLM'siz, DB'siz.
 *   npx tsx scripts/test-user-filters.ts
 */
import assert from "node:assert/strict";
import type { AdminUser } from "@glotmate/contracts";
import { applyUserFilters, isActive, summarizeUsers } from "../src/lib/userFilters";

const NOW = Date.parse("2026-09-21T12:00:00Z");
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000).toISOString();

const U = (p: Partial<AdminUser> & Pick<AdminUser, "id">): AdminUser => ({
  email: `${p.id}@x.com`,
  isAdmin: false,
  createdAt: daysAgo(100),
  lastSignInAt: null,
  hasProfile: true,
  displayName: null,
  nativeLanguage: "tr",
  cefrLevel: "A1",
  track: "everyday",
  tutorLanguage: "native",
  lessonsCompleted: 0,
  lessonsInProgress: 0,
  sessionCount: 0,
  lastSessionAt: null,
  llmCostUsd: 0,
  ...p,
});

const users: AdminUser[] = [
  U({ id: "ada", isAdmin: true, lastSignInAt: daysAgo(1), llmCostUsd: 1.5, displayName: "Ada" }),
  U({ id: "bob", cefrLevel: "B1", lastSessionAt: daysAgo(10), llmCostUsd: 0.25 }),
  U({ id: "cem", hasProfile: false, cefrLevel: null, lastSignInAt: daysAgo(45) }),
  U({ id: "dua", lastSignInAt: daysAgo(60), lastSessionAt: daysAgo(2) }),
];
const base = { q: "", level: "all" as const, onlyAdmins: false, onlyActive: false };
const ids = (xs: AdminUser[]) => xs.map((u) => u.id);

assert.deepEqual(ids(applyUserFilters(users, base, NOW)), ["ada", "bob", "cem", "dua"]);
assert.deepEqual(ids(applyUserFilters(users, { ...base, level: "B1" }, NOW)), ["bob"], "seviye");
assert.deepEqual(ids(applyUserFilters(users, { ...base, onlyAdmins: true }, NOW)), ["ada"], "admin");
assert.deepEqual(ids(applyUserFilters(users, { ...base, onlyActive: true }, NOW)), ["ada", "bob", "dua"], "30 gün: giriş VEYA oturum");
assert.deepEqual(ids(applyUserFilters(users, { ...base, q: " ADA" }, NOW)), ["ada"], "arama ad/e-posta, büyük-küçük duyarsız");
assert.equal(isActive(users[2]!, NOW), false, "45 gün önce → pasif");
assert.equal(isActive(users[3]!, NOW), true, "eski giriş ama yeni oturum → aktif");

assert.deepEqual(summarizeUsers(users, NOW), { total: 4, withProfile: 3, active30d: 3, admins: 1, totalCostUsd: 1.75 });

console.log("✅ userFilters: tüm vakalar geçti");

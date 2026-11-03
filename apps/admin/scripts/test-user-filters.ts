/**
 * Kullanıcı süzme/özet yardımcılarının doğruluk tablosu — LLM'siz, DB'siz.
 *   npx tsx scripts/test-user-filters.ts
 */
import assert from "node:assert/strict";
import type { AdminUser } from "@glotmate/contracts";
import { applyUserFilters, isActive, sortUsers, summarizeUsers } from "../src/lib/userFilters";

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
  isAnonymous: false,
  isPro: false,
  proSource: null,
  ...p,
});

const users: AdminUser[] = [
  U({ id: "ada", isAdmin: true, lastSignInAt: daysAgo(1), llmCostUsd: 1.5, displayName: "Ada" }),
  U({ id: "bob", cefrLevel: "B1", lastSessionAt: daysAgo(10), llmCostUsd: 0.25 }),
  U({ id: "cem", hasProfile: false, cefrLevel: null, lastSignInAt: daysAgo(45), isAnonymous: true, email: null }),
  U({ id: "dua", lastSignInAt: daysAgo(60), lastSessionAt: daysAgo(2), isPro: true, proSource: "admin", createdAt: daysAgo(5) }),
];
const base = { q: "", level: "all" as const, plan: "all" as const, account: "all" as const, onlyAdmins: false, onlyActive: false };
const ids = (xs: AdminUser[]) => xs.map((u) => u.id);

assert.deepEqual(ids(applyUserFilters(users, base, NOW)), ["ada", "bob", "cem", "dua"]);
assert.deepEqual(ids(applyUserFilters(users, { ...base, level: "B1" }, NOW)), ["bob"], "seviye");
assert.deepEqual(ids(applyUserFilters(users, { ...base, onlyAdmins: true }, NOW)), ["ada"], "admin");
assert.deepEqual(ids(applyUserFilters(users, { ...base, onlyActive: true }, NOW)), ["ada", "bob", "dua"], "30 gün: giriş VEYA oturum");
assert.deepEqual(ids(applyUserFilters(users, { ...base, q: " ADA" }, NOW)), ["ada"], "arama ad/e-posta, büyük-küçük duyarsız");
assert.equal(isActive(users[2]!, NOW), false, "45 gün önce → pasif");
assert.equal(isActive(users[3]!, NOW), true, "eski giriş ama yeni oturum → aktif");

assert.deepEqual(ids(applyUserFilters(users, { ...base, plan: "pro" }, NOW)), ["dua"], "yalnız Pro");
assert.deepEqual(ids(applyUserFilters(users, { ...base, plan: "free" }, NOW)), ["ada", "bob", "cem"], "yalnız ücretsiz");
assert.deepEqual(ids(applyUserFilters(users, { ...base, account: "guest" }, NOW)), ["cem"], "misafir = anonim");
assert.deepEqual(ids(applyUserFilters(users, { ...base, account: "registered" }, NOW)), ["ada", "bob", "dua"], "kayıtlı");

assert.deepEqual(ids(sortUsers(users, "active")), ["ada", "dua", "bob", "cem"], "son aktiflik: giriş/oturumun yenisi");
assert.deepEqual(ids(sortUsers(users, "newest")), ["dua", "ada", "bob", "cem"], "kayıt tarihi, eşitlikte sıra korunur");
assert.deepEqual(ids(sortUsers(users, "cost")), ["ada", "bob", "dua", "cem"], "maliyet, eşitlikte yeni kayıt önce");
assert.deepEqual(ids(sortUsers(users, "email")).at(-1), "cem", "e-postasız misafir alfabetik listenin sonunda");

assert.deepEqual(summarizeUsers(users, NOW), { total: 4, withProfile: 3, active30d: 3, admins: 1, guests: 1, pro: 1, totalCostUsd: 1.75 });

console.log("✅ userFilters: tüm vakalar geçti");

/** Roleplay listesi süzme/sıralama/özet — LLM'siz, DB'siz.  npx tsx scripts/test-roleplay-filters.ts */
import assert from "node:assert/strict";
import { ROLEPLAY_CATEGORIES, type AdminRoleplayRow } from "@glotmate/contracts";
import {
  DEFAULT_ROLEPLAY_FILTERS,
  applyRoleplayFilters,
  roleplayCategories,
  sortRoleplays,
  summarizeRoleplays,
} from "../src/lib/roleplayFilters";

const R = (p: Partial<AdminRoleplayRow> & Pick<AdminRoleplayRow, "id" | "title">): AdminRoleplayRow => ({
  category: "Eating out",
  status: "active",
  supportedFrom: "A1",
  recommendedFrom: "A2",
  publishedRevision: 1,
  hasDraft: false,
  objectiveCount: 3,
  attempts30d: 0,
  attemptsTotal: 0,
  avgCompletion: null,
  updatedAt: "2026-10-01T00:00:00Z",
  ...p,
});

const rows: AdminRoleplayRow[] = [
  R({ id: "rp-cafe", title: "Cafe order", attempts30d: 5, attemptsTotal: 9, avgCompletion: 0.8 }),
  R({ id: "rp-hotel", title: "Hotel check-in", category: "Travel", attempts30d: 5, attemptsTotal: 12, avgCompletion: 0.4, updatedAt: "2026-10-05T00:00:00Z" }),
  R({ id: "rp-pharmacy", title: "At the pharmacy", category: "Health", status: "retired", hasDraft: true }),
  R({ id: "rp-x", title: "Zoo tickets", category: "Leisure", publishedRevision: null, hasDraft: true, attempts30d: 1, attemptsTotal: 1, avgCompletion: 1 }),
];
const ids = (xs: AdminRoleplayRow[]) => xs.map((r) => r.id);
const f = DEFAULT_ROLEPLAY_FILTERS;

assert.deepEqual(ids(applyRoleplayFilters(rows, f)), ["rp-cafe", "rp-hotel", "rp-pharmacy", "rp-x"]);
assert.deepEqual(ids(applyRoleplayFilters(rows, { ...f, status: "retired" })), ["rp-pharmacy"]);
assert.deepEqual(ids(applyRoleplayFilters(rows, { ...f, status: "active" })), ["rp-cafe", "rp-hotel", "rp-x"]);
assert.deepEqual(ids(applyRoleplayFilters(rows, { ...f, category: "Travel" })), ["rp-hotel"]);
assert.deepEqual(ids(applyRoleplayFilters(rows, { ...f, q: " HOTEL" })), ["rp-hotel"], "başlık, büyük-küçük duyarsız");
assert.deepEqual(ids(applyRoleplayFilters(rows, { ...f, q: "health" })), ["rp-pharmacy"], "kategori de aranır");

assert.deepEqual(ids(sortRoleplays(rows, "title")), ["rp-pharmacy", "rp-cafe", "rp-hotel", "rp-x"]);
assert.deepEqual(ids(sortRoleplays(rows, "attempts30d")), ["rp-cafe", "rp-hotel", "rp-x", "rp-pharmacy"], "eşitlikte başlık");
assert.deepEqual(ids(sortRoleplays(rows, "attemptsTotal")), ["rp-hotel", "rp-cafe", "rp-x", "rp-pharmacy"]);
assert.deepEqual(ids(sortRoleplays(rows, "completion")), ["rp-hotel", "rp-cafe", "rp-x", "rp-pharmacy"], "düşük önce, denemesiz sonda");
assert.equal(sortRoleplays(rows, "updated")[0]!.id, "rp-hotel");

const cats = roleplayCategories(rows);
assert.deepEqual(cats.slice(0, ROLEPLAY_CATEGORIES.length), [...ROLEPLAY_CATEGORIES], "bilinen raflar kendi sırasıyla");
assert.deepEqual(cats.slice(ROLEPLAY_CATEGORIES.length), ["Leisure"], "bilinmeyen kategori sonda");

assert.deepEqual(summarizeRoleplays(rows), { total: 4, retired: 1, published: 3, drafts: 2, attempts30d: 11 });
console.log("✅ roleplayFilters: tüm vakalar geçti");

/** Sayfalama yardımcısı — LLM'siz, DB'siz.  npx tsx scripts/test-paginate.ts */
import assert from "node:assert/strict";
import { paginate } from "../src/lib/paginate";

const xs = Array.from({ length: 103 }, (_, i) => i + 1);
assert.deepEqual(paginate(xs, 1, 25).items.slice(0, 3), [1, 2, 3]);
assert.equal(paginate(xs, 1, 25).pageCount, 5);
assert.deepEqual(paginate(xs, 5, 25).items, [101, 102, 103], "son sayfa kısa");
assert.equal(paginate(xs, 99, 25).page, 5, "aralık dışı sayfa son sayfaya kırpılır");
assert.equal(paginate(xs, 0, 25).page, 1, "0 → 1");
const p3 = paginate(xs, 3, 50);
assert.deepEqual([p3.from, p3.to, p3.items.length], [101, 103, 3]);
const empty = paginate([], 1, 25);
assert.deepEqual([empty.total, empty.pageCount, empty.from, empty.to, empty.items.length], [0, 1, 0, 0, 0]);
console.log("✅ paginate: tüm vakalar geçti");

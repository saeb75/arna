/** El yapımı grafik ölçeği — LLM'siz, DB'siz.  npx tsx scripts/test-chart.ts */
import assert from "node:assert/strict";
import { axisTicks, barPercent, niceCeil } from "../src/lib/chart";

assert.equal(niceCeil(0), 0, "boş aralık");
assert.equal(niceCeil(-3), 0);
assert.equal(niceCeil(0.0123), 0.02);
assert.equal(niceCeil(0.3), 0.5);
assert.equal(niceCeil(0.1 + 0.2), 0.5, "kayan nokta artığı tavanı kaydırmaz");
assert.equal(niceCeil(1), 1, "tam değer kendisi");
assert.equal(niceCeil(1.2), 2);
assert.equal(niceCeil(2.2), 2.5);
assert.equal(niceCeil(3), 5);
assert.equal(niceCeil(7.5), 10);
assert.equal(niceCeil(42), 50);
assert.equal(niceCeil(250), 250);

assert.equal(barPercent(0, 10), 0);
assert.equal(barPercent(5, 10), 50);
assert.equal(barPercent(0.001, 10), 1.5, "sıfır olmayan değer görünür kalır");
assert.equal(barPercent(20, 10), 100, "tavan aşılmaz");
assert.equal(barPercent(3, 0), 0);

assert.deepEqual(axisTicks(0), []);
assert.deepEqual(axisTicks(1), [0]);
assert.deepEqual(axisTicks(2), [0, 1]);
assert.deepEqual(axisTicks(30), [0, 14, 29]);
console.log("✅ chart: tüm vakalar geçti");

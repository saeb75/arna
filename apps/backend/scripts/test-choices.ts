/** Şık permütasyonu — doğruluk tablosu + gerçek külliyat üzerinde dağılım. LLM YOK.
 *
 *  Bu test bir ölçüm sızıntısının ardından kondu: yayınlanmış 208 MCQ'nun 201'i
 *  `correctIndex: 0` ile yazılmıştı, yani "hep ilkini seç" %97 doğru ediyordu.
 *  Düzeltme servis anında yapılıyor; burada üç şey sınanır:
 *    1. permuteChoices deterministik ve tutarlı mı
 *    2. permütasyondan sonra `exampleAnswer === options[correctIndex]` duruyor mu
 *    3. gerçek külliyatta doğru indeks artık dağılıyor mu
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-choices.ts` */
import { permuteChoices, type LessonCore } from "@arna/contracts";
import { sql } from "../src/db/client.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

console.log("\n=== SAF FONKSİYON ===");
const opts = ["A", "B", "C", "D"];

const p1 = permuteChoices("seed-1", opts, 0);
const p2 = permuteChoices("seed-1", opts, 0);
check("aynı tohum → aynı dizilim", JSON.stringify(p1) === JSON.stringify(p2), p1.options.join(""));
check("doğru şık DEĞERİYLE takip ediliyor", p1.options[p1.correctIndex] === "A", `index ${p1.correctIndex}`);
check("şıklar korunuyor (kayıp/çoğaltma yok)",
  [...p1.options].sort().join("") === [...opts].sort().join(""), p1.options.join(""));
check("order[i] = yeni i. şıkkın ESKİ indeksi",
  p1.order.every((old, i) => opts[old] === p1.options[i]), JSON.stringify(p1.order));

const p3 = permuteChoices("seed-2", opts, 0);
check("farklı tohum → farklı dizilim üretebiliyor", JSON.stringify(p3.options) !== JSON.stringify(p1.options),
  `${p1.options.join("")} vs ${p3.options.join("")}`);

const p4 = permuteChoices("x", ["only"], 0);
check("tek şık dokunulmadan döner", p4.options.length === 1 && p4.correctIndex === 0);

// Tohum uzayında dağılım: tek bir tohum şanslı olabilir, 400 tohum olamaz.
const spread: Record<number, number> = {};
for (let i = 0; i < 400; i++) {
  const p = permuteChoices(`lesson-${i}:ex1`, opts, 0);
  spread[p.correctIndex] = (spread[p.correctIndex] ?? 0) + 1;
}
check("400 tohumda dört konum da çıkıyor", Object.keys(spread).length === 4, JSON.stringify(spread));
const maxShare = Math.max(...Object.values(spread)) / 400;
check("hiçbir konum %40'ı geçmiyor", maxShare < 0.4, `en yoğun konum %${Math.round(maxShare * 100)}`);

// --- Gerçek külliyat --------------------------------------------------------
// resolveLesson'un tohum formülü: `${coreId}:${beat.id}`
console.log("\n=== YAYINLI ÇEKİRDEKLER ===");
const rows = await sql<{ id: string; level: string; core: LessonCore }[]>`
  select lc.id, cl.level, lc.core from lesson_cores lc
  join catalog_lessons cl on cl.id = lc.catalog_lesson_id
  where lc.status = 'published'`;

const before: Record<number, number> = {};
const after: Record<number, number> = {};
let invariantBroken = 0;
let total = 0;

for (const row of rows) {
  for (const b of row.core.lecture.beats) {
    if (b.kind !== "exercise" || b.answerSpec.kind !== "choice" || !b.options?.length) continue;
    total++;
    before[b.answerSpec.correctIndex] = (before[b.answerSpec.correctIndex] ?? 0) + 1;
    const p = permuteChoices(`${row.id}:${b.id}`, b.options, b.answerSpec.correctIndex);
    after[p.correctIndex] = (after[p.correctIndex] ?? 0) + 1;
    // Lint kuralı: exampleAnswer doğru şıkkın birebir kopyası olmalı
    if (b.exampleAnswer.trim() !== p.options[p.correctIndex]!.trim()) invariantBroken++;
  }
}

console.log(`   ${rows.length} yayınlı çekirdek · ${total} çoktan seçmeli alıştırma`);
console.log(`   önce: ${JSON.stringify(before)}`);
console.log(`   sonra: ${JSON.stringify(after)}`);

check("külliyatta MCQ var", total > 0, `${total}`);
check("permütasyondan sonra exampleAnswer hâlâ doğru şıkka eşit", invariantBroken === 0, `${invariantBroken} bozuk`);
const firstShareBefore = (before[0] ?? 0) / total;
const firstShareAfter = (after[0] ?? 0) / total;
check("ÖNCE: 'hep ilkini seç' baskındı (bu testin var olma sebebi)", firstShareBefore > 0.8,
  `%${Math.round(firstShareBefore * 100)}`);
check("SONRA: 'hep ilkini seç' artık avantaj değil", firstShareAfter < 0.5,
  `%${Math.round(firstShareAfter * 100)}`);

await sql.end();
console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);

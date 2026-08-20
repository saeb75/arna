/** Yazarlık standardı — ölçütün tutarlılığı, yazım ve biçim. LLM ÇAĞRISI YOK.
 *
 *  Üç inceleme turunda bulunan hataların MEKANİK olarak yakalanabilen kısmı.
 *  Üçü de kesin: külliyatta yanlış pozitif vermiyorlar.
 *
 *  1) SAYI ÇELİŞKİSİ — `criteria`/`success` "at least two" derken `mustUse`'da tek
 *     ifade varsa ölçüt SAĞLANAMAZ; öğrenci doğru cevapta bile başarısız sayılır.
 *     Canlıda 3 vaka çıktı (B1).
 *  2) YAZIM — A1/A2 İngiliz İngilizcesi yazıldı, LLM üretimi B1 Amerikan'a kaymıştı
 *     (90 örnek). Aynı dersin içinde iki norm görmek öğrenciyi yanıltır.
 *  3) BİÇİM — `summary` ders sonunda ÖĞRENCİYE gösterilir, o yüzden ona hitap
 *     etmeli ("You learned…"); B1'de 68'i öğretmen notu gibiydi. `objectives`
 *     tek biçimde olmalı; B1'de üç ayrı kalıp karışıktı (148/7/7).
 *
 *  Kasten YOK: "always/never/only" gibi mutlak kelime taraması. Külliyatta 73
 *  eşleşme veriyor ve çoğu meşru ("Do not add -s after I, you, we or they").
 *  Gerçek itirazlar semantikti — kelime listesiyle bulunamaz, ve CLAUDE.md'de
 *  yasaklı kalıptır. O sınıf insan incelemesinde kalıyor.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-authoring-style.ts` */
import { LESSONS as A1 } from "./authored/a1.js";
import { LESSONS as A2 } from "./authored/a2.js";
import { LESSONS as B1 } from "./authored/b1.js";
import { LESSONS as B2 } from "./authored/b2.js";
import { LESSONS as C1 } from "./authored/c1.js";
import { LESSONS as C2 } from "./authored/c2.js";
import type { Authored } from "./authored/dsl.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const LEVELS: [string, Authored[]][] = [["A1", A1], ["A2", A2], ["B1", B1], ["B2", B2], ["C1", C1], ["C2", C2]];

// --- 1) Ölçütteki sayı `mustUse` uzunluğunu aşamaz -------------------------
const COUNT = /\bat least (one|two|three|four|1|2|3|4)\b/i;
const N: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, "1": 1, "2": 2, "3": 3, "4": 4 };

// --- 2) İngiliz yazım -------------------------------------------------------
const US = /\b(neighbor|neighbors|neighborhood|neighboring|traveled|traveling|traveler|travelers|canceled|canceling|color|colors|colored|colorful|favorite|favorites|organize|organized|organizing|organization|realize|realized|realizing|recognize|recognized|recognizing|practiced|practicing|apologize|apologized|summarize|emphasize|soccer)\b/i;

// --- 3) Biçim ---------------------------------------------------------------
const SUMMARY_OK = /^You (learned|practised)\b/;
const OBJECTIVE_BAD = /^(Can |I can |The learner)/;

for (const [level, lessons] of LEVELS) {
  const clashes: string[] = [];
  const spelling: string[] = [];
  const style: string[] = [];

  for (const l of lessons) {
    const must = l.open?.must ?? [];
    if (must.length) {
      for (const [field, text] of [["criteria", l.open!.criteria], ["success", l.success]] as const) {
        const m = text.match(COUNT);
        if (m && N[m[1]!.toLowerCase()]! > must.length) {
          clashes.push(`${l.id} ${field}: "${m[0]}" ama mustUse'da ${must.length} ifade var`);
        }
      }
    }

    const blob = JSON.stringify(l);
    const hit = blob.match(new RegExp(US.source, "gi"));
    if (hit) spelling.push(`${l.id}: ${[...new Set(hit.map((h) => h.toLowerCase()))].join(", ")}`);

    if (!SUMMARY_OK.test(l.summary)) style.push(`${l.id} summary: "${l.summary.slice(0, 45)}…"`);
    for (const o of l.objectives) {
      if (OBJECTIVE_BAD.test(o)) style.push(`${l.id} objective: "${o.slice(0, 45)}…"`);
    }
  }

  console.log(`\n=== ${level} (${lessons.length} ders) ===`);
  check("ölçütteki sayı mustUse ile tutarlı", clashes.length === 0, clashes.slice(0, 3).join(" | "));
  check("İngiliz yazım", spelling.length === 0, spelling.slice(0, 3).join(" | "));
  check("summary öğrenciye hitap ediyor, objectives tek biçimde", style.length === 0, style.slice(0, 3).join(" | "));
}

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} denetim başarısız`}`);
process.exit(fail === 0 ? 0 : 1);

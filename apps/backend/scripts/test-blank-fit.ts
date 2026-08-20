/** Boşluğa cevabı koyunca cümle BOZULUYOR mu? LLM ÇAĞRISI YOK.
 *
 *  Canlıda bulunan hata sınıfı: kabul edilen cevap boşluğun hemen yanındaki
 *  kelimeyi tekrar ediyor.
 *
 *    "The museum ___ by a famous designer."  + "was designed by"
 *      → "The museum was designed by by a famous designer."
 *
 *  Bunlar lint'ten geçiyordu çünkü her alan tek başına geçerliydi; hata ancak
 *  BİRLEŞİMDE ortaya çıkıyor. Öğrenci doğru cevabı yazsa bile ipucunda bozuk
 *  cümle görüyor, üstelik alternatif kabuller ekranda hiç denetlenmiyor.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-blank-fit.ts` */
import { LESSONS as A1 } from "./authored/a1.js";
import { LESSONS as A2 } from "./authored/a2.js";
import { LESSONS as B1 } from "./authored/b1.js";
import { LESSONS as B2 } from "./authored/b2.js";
import { LESSONS as C1 } from "./authored/c1.js";
import { LESSONS as C2 } from "./authored/c2.js";
import type { Authored } from "./authored/dsl.js";

let fail = 0;
const report: string[] = [];

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/**
 * Boşluğu doldurup ARDIŞIK TEKRAR EDEN ÖBEK arar.
 *
 * Tek kelime yetmiyor: canlı hataların çoğu öbek düzeyinde ("...a message for you
 * for you", "Although it was it was expensive"). Bu yüzden 1-4 kelimelik pencereler
 * denenir. Parantezli fiil ipucu ("(arrive)") şablonun parçasıdır, denetimden
 * ÇIKARILIR — yoksa her ipuçlu soru yanlış pozitif üretir.
 */
function fillIn(template: string, answer: string): string {
  return template.replace("___", answer);
}

function repeatedPhrase(template: string, answer: string): string | null {
  const filled = fillIn(template, answer);
  const w = words(filled.replace(/\([^)]*\)/g, " "));
  for (let n = 1; n <= 4; n++) {
    for (let i = 0; i + 2 * n <= w.length; i++) {
      let same = true;
      for (let k = 0; k < n; k++) if (w[i + k] !== w[i + n + k]) { same = false; break; }
      if (!same) continue;
      // Özgün şablonda zaten var olan tekrarı sayma ("had had" gibi gerçek çiftler)
      const bare = words(template.replace("___", " ").replace(/\([^)]*\)/g, " "));
      let inOriginal = false;
      for (let j = 0; j + 2 * n <= bare.length; j++) {
        let eq = true;
        for (let k = 0; k < n; k++) if (bare[j + k] !== bare[j + n + k]) { eq = false; break; }
        if (eq) inOriginal = true;
      }
      if (!inOriginal) return filled;
    }
  }
  return null;
}

for (const [level, lessons] of [["A1", A1], ["A2", A2], ["B1", B1], ["B2", B2], ["C1", C1], ["C2", C2]] as const) {
  let checked = 0;
  const bad: string[] = [];
  for (const l of lessons as Authored[]) {
    for (const e of l.ex) {
      if (e.t !== "fill") continue;
      for (const a of e.accept) {
        checked++;
        const d = repeatedPhrase(e.item, a);
        if (d) bad.push(`${l.id} [alıştırma] "${a}" → ${d}`);
      }
    }
    for (const q of l.quiz ?? []) {
      if (q.t !== "qfill") continue;
      for (const a of q.answers) {
        checked++;
        const d = repeatedPhrase(q.text, a);
        if (d) bad.push(`${l.id} [quiz] "${a}" → ${d}`);
      }
    }
  }
  const ok = bad.length === 0;
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${level}: ${checked} boşluk-cevap çifti · ${bad.length} bozuk`);
  report.push(...bad);
}

if (report.length) {
  console.log();
  for (const r of report) console.log(`   ${r}`);
}

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} seviyede bozuk doldurma var`}`);
process.exit(fail === 0 ? 0 : 1);

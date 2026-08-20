/** Açık uçlu adım: örnek cevap istenen kalıbı gösteriyor mu? LLM ÇAĞRISI YOK.
 *
 *  `exampleAnswer` öğrenciye İPUCU butonunda gösteriliyor — takılıp bilerek
 *  istediği an. O anda öğretilen kalıbı hiç içermeyen bir örnek, ölçüm değil
 *  ÖĞRETİM hatasıdır. Canlıda 7 vaka bulundu (A1 6, B1 1) ve bu kural kondu.
 *
 *  Kural "en az biri", "hepsi" DEĞİL — sebebi aşağıdaki 4. vakada sınanıyor.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-open-rubric.ts` */
import { buildCore, type Authored } from "./authored/dsl.js";
import { LESSONS as A1 } from "./authored/a1.js";
import { LESSONS as A2 } from "./authored/a2.js";
import { LESSONS as B1 } from "./authored/b1.js";
import { LESSONS as B2 } from "./authored/b2.js";
import { LESSONS as C1 } from "./authored/c1.js";
import { LESSONS as C2 } from "./authored/c2.js";
import { lintCore } from "../src/modules/lesson/lintLayers.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const CATALOG = { focus: "test focus", mustUse: ["I did it", "yesterday I did"] };
/** Dersi lint'ten geçirip YALNIZCA bu kuralın uyarılarını sayar. */
const rubricWarnings = (a: Authored): string[] =>
  lintCore(buildCore(a, CATALOG), { forbidden: [] }).warnings.filter((w) => w.includes("mustUse"));

const base = A1.find((l) => l.id === "a1-she-works-at-night")!;
const withOpen = (open: Authored["open"]): Authored => ({ ...base, open });

console.log("\n=== KURAL DOĞRULUK TABLOSU ===");

check("düzeltilmiş gerçek ders → uyarı yok", rubricWarnings(base).length === 0,
  JSON.stringify(rubricWarnings(base)));

const broken = rubricWarnings(withOpen({ ...base.open!, example: "My cousin is a doctor in the city." }));
check("örnek hiçbir kalıbı göstermiyor → uyarı", broken.length === 1, broken[0]?.slice(0, 90) ?? "yok");

// Canlıdaki tek B1 vakası buydu: kalıp oradaydı, kısaltma yüzünden görünmüyordu.
check("kısaltma yanlış pozitif üretmiyor (we'd ↔ would)",
  rubricWarnings(withOpen({ ...base.open!, must: ["would"], example: "Every summer we'd visit the beach." })).length === 0);
check("kısaltma diğer yönde de çalışıyor (it's ↔ it is)",
  rubricWarnings(withOpen({ ...base.open!, must: ["it is a small"], example: "It's a small black bag." })).length === 0);

// "Hepsi" kuralı olsaydı bu uyarırdı ve 58 kez boşuna bağırırdı; sorular zaten
// "use ONE of the phrases" diyor.
check("kalıplardan BİRİ yeter, hepsi aranmaz",
  rubricWarnings(withOpen({
    ...base.open!,
    // Üç kalıptan yalnız "she works" var; diğer ikisi yok ve olması da gerekmiyor.
    must: ["she works", "he lives", "they study"],
    example: "She works in a shop and finishes late.",
  })).length === 0);

check("mustUse boşsa kural susar",
  rubricWarnings(withOpen({ ...base.open!, must: [], example: "Anything at all." })).length === 0);

console.log("\n=== YAZILMIŞ KÜLLİYAT ===");
for (const [name, lessons] of [["A1", A1], ["A2", A2], ["B1", B1], ["B2", B2], ["C1", C1], ["C2", C2]] as const) {
  const bad = lessons.filter((l) => l.open && rubricWarnings(l).length > 0);
  check(`${name}: her açık uçlu adım kalıbını gösteriyor`, bad.length === 0,
    bad.length ? bad.map((l) => l.id).join(", ") : `${lessons.filter((l) => l.open).length} ders`);
}

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);

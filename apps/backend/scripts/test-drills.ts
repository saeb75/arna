/** OYUN BLOĞU (drills) doğruluk tablosu — puanlama, tekrar kuyruğu, lint kapıları.
 *
 *  LLM ÇAĞRISI YOK, DB YOK — saf fonksiyonlar. Saniyeler içinde koşar.
 *  Yazarlık kuralı değiştirmeden ya da yeni drill türü eklemeden önce buraya vaka eklenir.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-drills.ts` */
import {
  correctedSentence,
  currentDrill,
  drillAnswerTiles,
  drillItemSchema,
  drillProgress,
  gradeDrill,
  initialDrillState,
  lessonCoreSchema,
  matchPairOk,
  nextDrillStep,
  sentenceTiles,
  skipSpeakDrills,
  spokenWordHits,
  type DrillItem,
  type DrillOf,
  type LessonCore,
} from "@glotmate/contracts";
import { lintCore } from "../src/modules/lesson/lintLayers.js";
import { buildCore, type Authored } from "./authored/dsl.js";
import { LESSONS as A1 } from "./authored/a1.js";

let pass = 0;
let fail = 0;
function ok(label: string, cond: boolean) {
  if (cond) pass++;
  else {
    fail++;
    console.log(`❌ ${label}`);
  }
}

const item = <T extends DrillItem["type"]>(d: Record<string, unknown> & { type: T }) =>
  drillItemSchema.parse({ id: "x", pointRef: "p1", ...d }) as DrillOf<T>;

// --- Puanlama -----------------------------------------------------------------
const fc = item({ type: "fill_choice", sentence: "I ___ a student.", options: ["am", "is", "are"], correctIndex: 0 });
ok("fill_choice doğru şık", gradeDrill(fc, { kind: "choice", index: 0 }));
ok("fill_choice yanlış şık", !gradeDrill(fc, { kind: "choice", index: 1 }));
ok("fill_choice yanlış cevap türü", !gradeDrill(fc, { kind: "tap", index: 0 }));

const arr = item({ type: "arrange", answer: "Hi, my name is Maria.", extraTiles: ["I"] });
ok("kartlar: iç noktalama atılır, cümle sonu son karta yapışır", JSON.stringify(drillAnswerTiles(arr)) === JSON.stringify(["Hi", "my", "name", "is", "Maria."]));
const stmt = item({ type: "arrange", answer: "They are at home." });
ok("kartlar: soru düzeni yanlış (son kart 'home.')", !gradeDrill(stmt, { kind: "tokens", tokens: ["are", "They", "at", "home."] }));
ok("kartlar: doğru düzen (noktalama puanlamada yok sayılır)", gradeDrill(stmt, { kind: "tokens", tokens: ["They", "are", "at", "home."] }));
ok("arrange doğru dizi", gradeDrill(arr, { kind: "tokens", tokens: ["Hi", "my", "name", "is", "Maria"] }));
ok("arrange büyük/küçük harf önemsiz", gradeDrill(arr, { kind: "tokens", tokens: ["hi", "my", "name", "is", "maria"] }));
ok("arrange yanlış sıra", !gradeDrill(arr, { kind: "tokens", tokens: ["my", "name", "is", "Maria", "Hi"] }));
ok("arrange çeldirici kart eklenmiş", !gradeDrill(arr, { kind: "tokens", tokens: ["Hi", "I", "my", "name", "is", "Maria"] }));
const arrAlt = item({ type: "arrange", answer: "I'm a student and he's a doctor.", alsoAccept: ["He's a doctor and I'm a student."] });
ok("arrange alsoAccept", gradeDrill(arrAlt, { kind: "tokens", tokens: sentenceTiles("He's a doctor and I'm a student.") }));

const fe = item({ type: "find_error", sentence: "We is in the same class.", wrongIndex: 1, fix: "are" });
ok("find_error doğru kelime", gradeDrill(fe, { kind: "tap", index: 1 }));
ok("find_error yanlış kelime", !gradeDrill(fe, { kind: "tap", index: 0 }));
ok("düzeltilmiş cümle", correctedSentence(fe) === "We are in the same class.");
const fe2 = item({ type: "find_error", sentence: "Is she at home? Yes, she's.", wrongIndex: 5, fix: "she is" });
ok("düzeltmede sondaki nokta korunur", correctedSentence(fe2) === "Is she at home? Yes, she is.");

const m = item({ type: "match", pairs: [{ left: "I", right: "am" }, { left: "she", right: "is" }, { left: "they", right: "are" }] });
ok("eşleştirme çifti doğru", matchPairOk(m, 1, "is"));
ok("eşleştirme çifti yanlış", !matchPairOk(m, 1, "are"));
ok("eşleştirme hatasız = doğru", gradeDrill(m, { kind: "match", mistakes: 0 }));
ok("eşleştirme hatalı = yanlış", !gradeDrill(m, { kind: "match", mistakes: 1 }));

const sp = item({ type: "speak", sentence: "She's my sister." });
ok("konuşma: birebir", gradeDrill(sp, { kind: "speech", text: "She's my sister." }));
ok("konuşma: STT noktalaması/harf", gradeDrill(sp, { kind: "speech", text: "she's my sister" }));
ok("konuşma: açık biçim kısaltmaya denk", gradeDrill(sp, { kind: "speech", text: "She is my sister." }));
ok("konuşma: öğretilen yapıda hoşgörü yok", !gradeDrill(sp, { kind: "speech", text: "She my sister." }));
ok("konuşma: boş", !gradeDrill(sp, { kind: "speech", text: "" }));
const hits = spokenWordHits("She's my sister.", "she is my brother");
ok("konuşma vurgusu: She's ✓ my ✓ sister ✗", JSON.stringify(hits) === JSON.stringify([true, true, false]));

const lcItem = item({ type: "listen_choose", audio: "How are you?", options: ["Who are you?", "How are you?", "How old are you?"], correctIndex: 1 });
ok("listen_choose", gradeDrill(lcItem, { kind: "choice", index: 1 }));
const la = item({ type: "listen_arrange", audio: "We're in the same class.", extraTiles: ["were"] });
ok("listen_arrange", gradeDrill(la, { kind: "tokens", tokens: ["We're", "in", "the", "same", "class"] }));
ok("listen_arrange homofon kart yanlış", !gradeDrill(la, { kind: "tokens", tokens: ["were", "in", "the", "same", "class"] }));

// --- Şema -----------------------------------------------------------------------
ok("şema: correctIndex aralık dışı reddedilir", !drillItemSchema.safeParse({ id: "x", pointRef: "p1", type: "fill_choice", sentence: "a ___", options: ["a", "b"], correctIndex: 2 }).success);
ok("şema: wrongIndex aralık dışı reddedilir", !drillItemSchema.safeParse({ id: "x", pointRef: "p1", type: "find_error", sentence: "We is.", wrongIndex: 5, fix: "are" }).success);

// --- Kuyruk ---------------------------------------------------------------------
const A = item({ type: "fill_choice", sentence: "a ___", options: ["x", "y"], correctIndex: 0 });
const items: DrillItem[] = [
  { ...A, id: "a" },
  { ...sp, id: "s" },
  { ...A, id: "b" },
  { ...m, id: "m" },
];
let st = initialDrillState();
ok("kuyruk: ilk madde a", currentDrill(items, st)?.id === "a");
st = nextDrillStep(items, st, false); // a yanlış → sona
ok("kuyruk: yanlış madde sona eklendi", st.retry.join() === "a");
st = nextDrillStep(items, st, false); // konuşma kartı yanlış (denemeler bitti) → tekrar YOK
ok("kuyruk: konuşma kartı tekrar kuyruğuna girmez", st.retry.join() === "a");
st = nextDrillStep(items, st, true); // b doğru
st = nextDrillStep(items, st, false); // eşleştirme hatalı → tekrar YOK
ok("kuyruk: eşleştirme tekrar kuyruğuna girmez", st.retry.join() === "a");
ok("kuyruk: tekrar turunda a geri geldi", currentDrill(items, st)?.id === "a");
st = nextDrillStep(items, st, false); // a ikinci kez yanlış → bir daha eklenmez
ok("kuyruk: madde en fazla bir kez tekrarlanır", st.retry.join() === "a" && currentDrill(items, st) === null);
ok("kuyruk: ilerleme %100", drillProgress(items, st) === 1);
ok("kuyruk: ilk denemede doğrular", st.firstTry.join() === "b");

let st2 = nextDrillStep(items, initialDrillState(), true); // a doğru → cursor konuşma kartında
ok("konuşamıyorum: geçerli kart konuşma", currentDrill(items, st2)?.id === "s");
st2 = skipSpeakDrills(items, st2);
ok("konuşamıyorum: konuşma kartı atlandı", currentDrill(items, st2)?.id === "b");

// --- Lint kapıları --------------------------------------------------------------
const base = A1.find((a) => a.id === "a1-am-is-are")!;
const catalog = { focus: "the present of 'be'", mustUse: ["I am", "he is", "they are"] };
const lint = (a: Authored) => {
  const core = lessonCoreSchema.parse(buildCore(a, catalog)) as LessonCore;
  return lintCore(core, { forbidden: [], lessonKind: "grammar" });
};
ok("yazılı ders lint'ten temiz geçer", lint(base).errors.length === 0);

const drills = base.drills!;
const noP2 = { ...base, drills: drills.filter((d) => d.pointRef !== "p2") };
ok("kapsam: öğretim maddesinin drill'i yoksa HATA", lint(noP2).errors.some((e) => e.includes('"p2"')));

const noMix = { ...base, drills: drills.filter((d) => d.pointRef !== "mix") };
ok("kapsam: karışık set yoksa HATA", lint(noMix).errors.some((e) => e.includes("karışık")));

const noSpeak = { ...base, drills: drills.filter((d) => d.type !== "speak") };
ok("çeşitlilik: konuşma kartı yoksa HATA", lint(noSpeak).errors.some((e) => e.includes("speak")));

const twoBlanks = { ...base, drills: [{ ...drills[0]!, sentence: "I ___ a ___." } as typeof drills[number], ...drills.slice(1)] };
ok("yapı: iki boşluk HATA", lint(twoBlanks).errors.some((e) => e.includes("BİR ___")));

const fcs = drills.filter((d) => d.type === "fill_choice");
const run3 = { ...base, drills: [...fcs, { ...fcs[0]!, id: "z" }, ...drills.filter((d) => d.type !== "fill_choice")] };
ok("ritim: aynı tür art arda 3 HATA", lint(run3).errors.some((e) => e.includes("art arda")));

const mixed = { ...base, open: { q: "Tell me.", must: ["is"], criteria: "uses is", example: "She is nice." } };
let threw = false;
try {
  buildCore(mixed, catalog);
} catch {
  threw = true;
}
ok("karışık format: drills + open yazılamaz", threw);

const tooFew = { ...base, drills: drills.slice(0, 6) };
ok("sayı: gramer dersinde 6 drill HATA", lint(tooFew).errors.some((e) => e.includes("bekleniyor")));

console.log(`\n${fail === 0 ? "✅" : "❌"} ${pass} geçti, ${fail} başarısız`);
process.exit(fail === 0 ? 0 : 1);

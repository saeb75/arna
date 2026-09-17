/** Faz 7.7 doğrulama: `mustUse` ölçülebilir mi, sahne erken kesiliyor mu?
 *
 *  Canlı hata: roleplay konuşmanın ortasında kapanıyordu. Sebep `mustUse`:
 *   - "Present Simple for habits" gibi TARİFLER hiç eşleşmiyor → ölçüm ölü,
 *   - "do" gibi KIRINTILAR düz `includes` ile *don't*, *window* içinde bile
 *     eşleşiyor → iki turda goalMet tetiklenip sahne kapanıyordu.
 *
 *  LLM ÇAĞRISI YOK, DB YOK. Çalıştırma: `npx tsx scripts/test-mustuse.ts` */
import { PRACTICE_MIN_TURNS_BEFORE_GOAL } from "@glotmate/contracts";
import { lintMustUse } from "../src/modules/lesson/lint.js";

let pass = 0;
let fail = 0;
const ok = (label: string, cond: boolean, detail = "") => {
  if (cond) pass++;
  else {
    fail++;
    console.log(`❌ ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

// ---------------------------------------------------------------------------
// 1) LINT — hangi mustUse girdisi kabul, hangisi ret?
// ---------------------------------------------------------------------------
console.log("— lint —");

const accepted = [
  "I think",
  "in my opinion",
  "have you ever",
  "I'm getting used to",
  "would you mind",
  "I've never",
  "I don't usually",
  // -ing ile başlayan MEŞRU parça: "I am getting used to working here" içinde geçer.
  // Bunu eleyen bir kural denenmişti, üretimi düşürdüğü için kaldırıldı.
  "getting used to working",
];
const rejected = [
  // gerçek derslerden çıkan TARİFLER — hiç eşleşmiyorlardı
  "Present Simple for habits and routines",
  "past participle",
  "Present Simple Passive",
  "a formal greeting",
  "past simple irregular verbs (e.g. had, found, wrote)",
  "Past simple questions (Did you...?)",
  // gerçek derslerden çıkan KIRINTILAR — her şeye eşleşiyorlardı
  "do",
  "was",
];

for (const value of accepted) {
  const errors: string[] = [];
  lintMustUse(value, errors);
  ok(`kabul: "${value}"`, errors.length === 0, errors.join("; "));
}
for (const value of rejected) {
  const errors: string[] = [];
  lintMustUse(value, errors);
  ok(`ret: "${value}"`, errors.length > 0, "reddedilmesi gerekirdi");
}

// ---------------------------------------------------------------------------
// 2) EŞLEŞME — kelime sınırına saygı duyuyor mu?
//    (countTargetUses service.ts'te private; mantığı birebir burada aynalanıyor)
// ---------------------------------------------------------------------------
console.log("— eşleşme —");

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function countTargetUses(mustUse: string[], userTurns: string[]): number {
  const patterns = mustUse
    .map(norm)
    .filter((t) => t.length > 0)
    .map((t) => new RegExp(`(^| )${escape(t)}( |$)`));
  if (patterns.length === 0) return 0;
  return userTurns.filter((turn) => patterns.some((re) => re.test(norm(turn)))).length;
}

const hit = (target: string, sentence: string) => countTargetUses([target], [sentence]) === 1;

// Kelime İÇİNDE eşleşmemeli — canlı hatanın kaynağı buydu
ok(`"do" ⊄ "I don't know"`, !hit("do", "I don't know"));
ok(`"do" ⊄ "I looked out the window"`, !hit("do", "I looked out the window"));
ok(`"was" ⊄ "I went to Washington"`, !hit("was", "I went to Washington"));
// Gerçek kullanım YAKALANMALI
ok(`"do" ⊂ "What do you think?"`, hit("do", "What do you think?"));
ok(`"I think" ⊂ "Well, I think it is fine."`, hit("I think", "Well, I think it is fine."));
ok(`"have you ever" ⊂ "Have you ever been there?"`, hit("have you ever", "Have you ever been there?"));
ok(`cümle sonunda: "I've never" ⊂ "No, I've never"`, hit("I've never", "No, I've never"));
// Tur sayılır, toplam geçiş değil
ok(
  "aynı turda iki kez geçse de 1 sayılır",
  countTargetUses(["I think"], ["I think, I think it works"]) === 1,
);
ok(
  "iki ayrı tur 2 sayılır",
  countTargetUses(["I think"], ["I think so", "I think it is good"]) === 2,
);

// ---------------------------------------------------------------------------
// 3) SAHNE ERKEN KESİLMEZ — hedef tutturulsa bile minimum tur şartı var
// ---------------------------------------------------------------------------
console.log("— sahne uzunluğu —");

/** service.ts'teki goalMet ifadesinin birebir aynası. */
const goalMet = (turnIndex: number, uses: number, minTargetUses: number) =>
  turnIndex + 1 >= PRACTICE_MIN_TURNS_BEFORE_GOAL && uses >= minTargetUses;

ok("1. turda hedef tutsa bile sahne kapanmaz", !goalMet(0, 2, 2));
ok("2. turda hedef tutsa bile sahne kapanmaz", !goalMet(1, 3, 2));
ok("3. turda hâlâ kapanmaz", !goalMet(2, 5, 2));
ok(`${PRACTICE_MIN_TURNS_BEFORE_GOAL}. turda hedef tuttuysa kapanır`, goalMet(3, 2, 2));
ok("hedef tutmadıysa 4. turda da kapanmaz", !goalMet(3, 1, 2));

// ---------------------------------------------------------------------------
// 4) ŞIKLAR TEK KAYNAKTAN — ekranda iki kez görünmesin, sesli de okunsun
// ---------------------------------------------------------------------------
console.log("— çoktan seçmeli gösterimi —");

const OPTION_LETTERS = ["a", "b", "c", "d"];
/** page.tsx'teki exerciseText'in birebir aynası. */
function exerciseText(prompt: string, options?: string[]): string {
  if (!options?.length) return prompt;
  if (options.some((o) => prompt.includes(o))) return prompt;
  const lines = options.map((o, i) => `${OPTION_LETTERS[i]!.toUpperCase()}) ${o}`);
  return `${prompt}\n${lines.join("\n")}`;
}

const opts = ["Do you work here?", "Works you here?", "You do work here?"];

// Sağlıklı içerik: şıklar eklenir
const clean = exerciseText("Which is correct to ask a colleague?", opts);
ok("temiz içerikte şıklar ekleniyor", clean.includes("A) Do you work here?"));
ok("temiz içerikte her şık BİR kez", opts.every((o) => clean.split(o).length === 2));

// Bozuk eski içerik (canlıda görülen): şıklar prompt'a da gömülü → TEKRAR EKLENMEZ
const inlinedPrompt =
  "Which is correct to ask a colleague? A) Do you work here? B) Works you here? C) You do work here?";
const guarded = exerciseText(inlinedPrompt, opts);
ok("gömülü şıklar tekrar eklenmiyor", guarded === inlinedPrompt);
ok(
  "gömülü içerikte de her şık BİR kez görünüyor",
  opts.every((o) => guarded.split(o).length === 2),
  guarded,
);

// Lint bunu artık üretimde reddetmeli
const inlineErrors: string[] = [];
{
  const norm = (s: string) => s.trim().toLowerCase();
  const optionSet = new Set(opts.map(norm));
  if (!["Do you work here?"].some((a) => optionSet.has(norm(a)))) inlineErrors.push("cevap yok");
  const inlined = opts.filter((o) => inlinedPrompt.includes(o));
  if (inlined.length > 0) inlineErrors.push("şıklar prompt'a gömülü");
}
ok("lint gömülü şıkları yakalıyor", inlineErrors.some((e) => e.includes("gömülü")));

console.log(`\n${fail === 0 ? "✅" : "❌"} ${pass} geçti, ${fail} başarısız`);
process.exit(fail === 0 ? 0 : 1);

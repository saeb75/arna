/**
 * CEVAP İNCELEMESİ doğruluk taraması — GERÇEK modelle, DB'siz.
 *   cd apps/backend && npx tsx --env-file=.env scripts/test-answer-review-scan.ts [--model=gpt-6.1-terra] [--lang=es]
 *
 * Ölçülen risk: doğru cümleye "hata" demek (öğrenci haksız yere "Hatalarım"a düşer).
 * Yapısal beklenti kodla sınanır (hüküm kümesi + düzeltme alanı); açıklamanın üslubu
 * prompt'un sorumluluğudur, burada okunmak üzere yazdırılır. Prompt ya da
 * `answer_review` modeli değişmeden ÖNCE ve SONRA koşulur.
 */
import { answerReviewModelSchema, type AnswerReviewModelOutput } from "@glotmate/contracts";
import { generateJson } from "../src/modules/llm/generate.js";
import { MODEL_BY_PURPOSE } from "../src/modules/llm/models.js";
import { buildAnswerReviewPrompt } from "../src/modules/llm/prompts/answer-review.v1.js";

type Kind = AnswerReviewModelOutput["kind"];
interface Case {
  text: string;
  context?: string;
  /** Kabul edilen hükümler */
  want: Kind[];
}

const OK: Kind[] = ["correct"];
/** Doğru ama hafif pürüzlü: "unnatural" da savunulabilir, "error" DEĞİL */
const BAD: Kind[] = ["error", "unnatural"];

const cases: Case[] = [
  // --- DOĞRU: tam cümleler ---------------------------------------------------
  { text: "I'm from Turkey.", context: "Where are you from?", want: OK },
  { text: "I work as a nurse at a hospital.", context: "What do you do?", want: OK },
  { text: "Could I have the menu, please?", context: "Good evening! Table for one?", want: OK },
  { text: "I've been waiting for twenty minutes.", context: "How can I help you?", want: OK },
  { text: "I'd like to book a room for two nights.", context: "Hello, Grand Hotel. How can I help?", want: OK },
  { text: "She doesn't like coffee.", context: "Does your sister drink coffee?", want: OK },
  { text: "If I had more time, I would learn the guitar.", context: "What would you do with more free time?", want: OK },
  { text: "I think we should leave early.", context: "What do you think?", want: OK },
  { text: "Have you ever been to London?", context: "Ask me a question about travel.", want: OK },
  { text: "It was raining when I left the house.", context: "How was your morning?", want: OK },
  // --- DOĞRU: parça cevaplar, gündelik konuşma, STT biçimi --------------------
  { text: "twenty five", context: "How old are you?", want: OK },
  { text: "in Istanbul", context: "Where do you live?", want: OK },
  { text: "not really", context: "Do you like spicy food?", want: OK },
  { text: "yeah sounds good", context: "Shall we meet at six?", want: OK },
  { text: "a coffee please", context: "What can I get you?", want: OK },
  { text: "two tickets to Paris", context: "Where would you like to go?", want: OK },
  { text: "i dont know maybe tomorrow", context: "When can you come?", want: OK },
  { text: "hello my name is saeb nice to meet you", context: "Hi! I'm Marta. What's your name?", want: OK },
  { text: "gonna grab some lunch you want anything", context: "I'm staying at my desk today.", want: OK },
  { text: "me too", context: "I love this song.", want: OK },
  { text: "window seat if possible", context: "Do you have a seat preference?", want: OK },
  { text: "I'm good thanks and you", context: "How are you?", want: OK },
  { text: "can you say that again", context: "Your gate has been changed to B14.", want: OK },
  { text: "My name's Deniz.", context: "What's your name?", want: OK },
  { text: "because I missed the bus", context: "Why are you late?", want: OK },
  // --- HATA -------------------------------------------------------------------
  { text: "I am go to school every day.", context: "Tell me about your day.", want: ["error"] },
  { text: "She don't like coffee.", context: "Does your sister drink coffee?", want: ["error"] },
  { text: "I have 25 years old.", context: "How old are you?", want: BAD },
  { text: "Yesterday I go to the cinema.", context: "What did you do yesterday?", want: ["error"] },
  { text: "He is more taller than me.", context: "Tell me about your brother.", want: ["error"] },
  { text: "I am living here since five years.", context: "How long have you lived here?", want: ["error"] },
  { text: "Where you are from?", context: "Ask me a question.", want: ["error"] },
  { text: "I want a informations about the room.", context: "How can I help you?", want: ["error"] },
  { text: "I think use it better", context: "Which one would you choose?", want: BAD },
  { text: "I didn't went there.", context: "Did you visit the museum?", want: ["error"] },
  { text: "There is many people in the park.", context: "What can you see?", want: ["error"] },
  { text: "I am agree with you.", context: "I think it's too expensive.", want: BAD },
  { text: "Can you explain me the rules?", context: "Any questions?", want: BAD },
  { text: "I look forward to see you.", context: "See you on Monday!", want: BAD },
  { text: "She said me that she was tired.", context: "What did Anna say?", want: BAD },
  // --- BAŞKA DİL ---------------------------------------------------------------
  { text: "Bunu nasıl söyleyeceğimi bilmiyorum", context: "What would you like to order?", want: ["other_language"] },
  { text: "Bir kahve istiyorum lütfen", context: "What can I get you?", want: ["other_language"] },
  { text: "neden are kullanıyoruz", context: "Any questions about today's lesson?", want: ["other_language"] },
  { text: "Tekrar eder misin", context: "Your gate has been changed.", want: ["other_language"] },
  { text: "I want bir kahve", context: "What can I get you?", want: ["other_language", "error"] },
];

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const model = arg("model") ?? MODEL_BY_PURPOSE.answer_review;
const nativeLanguage = arg("lang") ?? "tr";

async function run(c: Case) {
  const { system, user } = buildAnswerReviewPrompt({ nativeLanguage, explainInNative: true, text: c.text, context: c.context });
  const t0 = Date.now();
  let tokens = { in: 0, out: 0 };
  const out = await generateJson({
    model,
    system,
    user,
    schema: answerReviewModelSchema,
    maxTokens: 800,
    onCall: async (r) => {
      tokens = { in: r.inputTokens, out: r.outputTokens };
    },
  });
  return { out, ms: Date.now() - t0, tokens };
}

const results = await Promise.all(
  cases.map(async (c) => {
    try {
      return { c, ...(await run(c)) };
    } catch (err) {
      return { c, err: String(err) };
    }
  }),
);

let fail = 0;
let falseAlarm = 0;
let tin = 0;
let tout = 0;
const lat: number[] = [];
for (const r of results) {
  if ("err" in r) {
    fail++;
    console.log(`💥 "${r.c.text}" → ${r.err}`);
    continue;
  }
  const { c, out } = r;
  tin += r.tokens.in;
  tout += r.tokens.out;
  lat.push(r.ms);
  // Yapısal: hüküm kümede mi; düzeltme alanı hükümle tutarlı mı
  const kindOk = c.want.includes(out.kind);
  const fieldOk = out.kind === "correct" ? true : out.corrected.trim().length > 0;
  const ok = kindOk && fieldOk;
  if (!ok) fail++;
  if (!kindOk && c.want.length === 1 && c.want[0] === "correct") falseAlarm++;
  console.log(`${ok ? "✅" : "❌"} [${out.kind}] "${c.text}"${out.corrected ? ` → "${out.corrected}"` : ""}`);
  if (out.explanation) console.log(`     ${out.explanation}`);
}
lat.sort((a, b) => a - b);
const correctCases = cases.filter((c) => c.want.length === 1 && c.want[0] === "correct").length;
console.log(
  `\n${model} · ${nativeLanguage}: ${cases.length - fail}/${cases.length} geçti · haksız hata ${falseAlarm}/${correctCases} · ` +
    `p50 ${lat[Math.floor(lat.length / 2)]} ms · ortalama ${Math.round(tin / lat.length)} giriş + ${Math.round(tout / lat.length)} çıkış token`,
);
process.exit(fail ? 1 : 0);

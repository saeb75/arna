/** Cevap incelemesi — ön eleme doğruluk tablosu + gerçek model koşusu.
 *
 *  İKİ BÖLÜM:
 *   A) `triageAnswer` doğruluk tablosu — LLM'siz, anlık, her koşuda çalışır.
 *   B) Gerçek `gpt-5.6-luna` koşusu — senaryo tablosu, İKİ ana dille.
 *
 *  B bölümü neden iki dille: bu özelliğin bozulacağı yer ana dil düzyazısıdır ve
 *  o hata sınıfını ekip GÖREMEZ. Azerice çıktı Türkçeye kayıyorsa ya da bozuksa
 *  model kararı burada elenir. Çıktı gözle okunmak İÇİN basılır.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-answer-review.ts`
 *              LLM'siz yalnız A için: `npx tsx scripts/test-answer-review.ts --no-llm` */
import "dotenv/config";
import { answerReviewModelSchema, triageAnswer, type AnswerReviewKind } from "@arna/contracts";
import { completeJson } from "../src/modules/llm/index.js";
import { ANSWER_REVIEW_VERSION, buildAnswerReviewPrompt } from "../src/modules/llm/prompts/answer-review.v1.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

// ---------------------------------------------------------------------------
// A) Ön eleme — LLM YOK
// ---------------------------------------------------------------------------

console.log("\n=== A) triageAnswer DOĞRULUK TABLOSU (LLM'siz) ===");

const TRIAGE: Array<[string, ReturnType<typeof triageAnswer>]> = [
  ["yes", "correct"],
  ["Yes!", "correct"],
  ["ok", "correct"],
  ["I don't know", "correct"],
  ["i dont know", "correct"],
  ["...", "too_short"],
  ["!!", "too_short"],
  ["", "too_short"],
  ["a", "too_short"],
  // Ana dildeki onaylar KASTEN kısayola girmez — dil paketi bakımı doğmasın diye
  ["evet", null],
  ["tamam", null],
  // Kısa ama hatalı cümle kısayola DÜŞMEMELİ (tam eşleşme kuralının sınavı)
  ["no thanks I good", null],
  ["I teacher am", null],
  ["I am a teacher.", null],
];

for (const [text, expected] of TRIAGE) {
  const got = triageAnswer(text);
  check(`"${text}" → ${expected ?? "LLM"}`, got === expected, got === expected ? "" : `geldi: ${got ?? "LLM"}`);
}

if (process.argv.includes("--no-llm")) {
  console.log(`\n${fail === 0 ? "✅ A bölümü temiz" : `❌ ${fail} hata`}`);
  process.exit(fail === 0 ? 0 : 1);
}

// ---------------------------------------------------------------------------
// B) Gerçek model koşusu
// ---------------------------------------------------------------------------

interface Case {
  text: string;
  context?: string;
  /** Birden fazla kabul edilebilir hüküm olabilir (error ↔ unnatural sınırı ince) */
  expect: AnswerReviewKind[];
  note?: string;
}

const CASES: Case[] = [
  { text: "I am a teacher.", expect: ["correct"] },
  { text: "I teacher am", expect: ["error"] },
  { text: "I am agree with you", expect: ["error", "unnatural"] },
  { text: "I want that you help me", expect: ["error", "unnatural"] },
  { text: "How can I go to airport?", expect: ["error"], note: "eksik artikel" },
  { text: "Ben öğretmenim", expect: ["other_language"] },
  { text: "evet", expect: ["other_language"] },
  // Cevap PARÇASI hata sayılmamalı — bağlam olmadan haksız ret üretirdi
  { text: "twenty five", context: "How old are you?", expect: ["correct"] },
  { text: "at the office", context: "Where do you work?", expect: ["correct"] },
  // Konuşma dili yazıya döküldüğü için nokta/büyük harf yok — hata DEĞİL
  { text: "yeah i work at a bank downtown", expect: ["correct"] },
];

const LANGS = ["tr", "az"];

for (const lang of LANGS) {
  console.log(`\n=== B) MODEL KOŞUSU — ana dil: ${lang} ===`);
  for (const c of CASES) {
    const { system, user } = buildAnswerReviewPrompt({
      nativeLanguage: lang,
      explainInNative: true,
      text: c.text,
      context: c.context,
    });
    try {
      const v = await completeJson({
        purpose: "answer_review",
        system,
        user,
        schema: answerReviewModelSchema,
        promptVersion: ANSWER_REVIEW_VERSION,
        maxTokens: 800,
      });

      const ok = c.expect.includes(v.kind);
      check(`"${c.text}" → ${v.kind}`, ok, ok ? "" : `beklenen: ${c.expect.join("|")}`);

      // Yapısal sözler: correct'te düzeltme olmaz, diğerlerinde olmalı
      if (v.kind === "correct") {
        check(`  ↳ correct'te "corrected" boş`, v.corrected.trim() === "", v.corrected);
      } else {
        check(`  ↳ "${v.kind}" düzeltme taşıyor`, v.corrected.trim().length > 0);
        check(`  ↳ "${v.kind}" açıklama taşıyor`, v.explanation.trim().length > 0);
      }
      if (v.corrected) console.log(`     EN: ${v.corrected}`);
      if (v.explanation) console.log(`     ${lang.toUpperCase()}: ${v.explanation}`);
    } catch (err) {
      check(`"${c.text}" çağrısı`, false, (err as Error).message.slice(0, 140));
    }
  }
}

console.log(
  `\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} hata`}\n` +
    `Ana dil düzyazısı GÖZLE okunmalı — şema doğru olsa da bozuk ${LANGS.join("/")} metni testten geçer.`,
);
process.exit(fail === 0 ? 0 : 1);

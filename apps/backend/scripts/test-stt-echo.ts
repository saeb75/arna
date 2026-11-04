/**
 * STT ipucu yankısı doğruluk tablosu — LLM'siz, anlık.
 *   cd apps/backend && npx tsx scripts/test-stt-echo.ts
 */
import { isPromptEcho } from "../src/modules/session/sttEcho.js";

const prompt = (l1: string) => `The speaker is learning English; their native language is ${l1}. They speak English, sometimes ${l1}.`;

const cases: Array<[label: string, transcript: string, l1: string, echo: boolean]> = [
  // Canlıda görülen biçimler (22 Eyl 2026)
  ["canlı yankı (Context sarmalı)", "Context: ### The speaker is learning English; their native language is Turkish. They speak English, sometimes Turkish. ###", "Turkish", true],
  ["canlı yankı (düz)", "The speaker is learning English; their native language is Turkish. They speak English, sometimes Turkish.", "Turkish", true],
  ["yarım yankı", "The speaker is learning English, their native language is Turkish.", "Turkish", true],
  ["İspanyolca ipucu yankısı", "The speaker is learning English; their native language is Spanish.", "Spanish", true],
  // Gerçek öğrenci sözleri ELENMEMELİ
  ["tanışma cümlesi", "My native language is Turkish", "Turkish", false],
  ["öğreniyorum", "I am learning English", "Turkish", false],
  ["konuşuyorum", "I speak English and Turkish", "Turkish", false],
  ["kısa cevap", "is", "Turkish", false],
  ["Türkçe soru", "neden are kullanıyoruz", "Turkish", false],
  ["uzun cevap", "Hello my name is Ana and I am from Spain", "Spanish", false],
];

let fail = 0;
for (const [label, transcript, l1, want] of cases) {
  const got = isPromptEcho(transcript, prompt(l1));
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label} → ${got ? "yankı" : "söz"}`);
}
console.log(fail ? `❌ ${fail} başarısız` : `✅ ${cases.length} geçti`);
process.exit(fail ? 1 : 0);

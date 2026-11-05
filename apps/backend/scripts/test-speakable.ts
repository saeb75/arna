/**
 * TTS metin normalizasyonu doğruluk tablosu — LLM'siz, anlık.
 *   cd apps/backend && npx tsx scripts/test-speakable.ts
 */
import { joinForSpeech, speakableText } from "../src/modules/tts/speakable.js";

const cases: Array<[label: string, got: string, want: string]> = [
  ["boşluk işareti durak olur", speakableText("My brother ___ a doctor."), "My brother … a doctor."],
  ["ipucu ayracı virgül olur", speakableText("hello / my name is / Ana"), "hello, my name is, Ana"],
  ["harf arası eğik çizgi", speakableText("Use he/she with is."), "Use he, she with is."],
  ["kalıp listesi", speakableText("am / is / are"), "am, is, are"],
  ["rakam arası dokunulmaz", speakableText("1/2 of the class"), "1/2 of the class"],
  ["düz metin değişmez", speakableText("Boşluğu doldur:"), "Boşluğu doldur:"],
  ["ek yapışır", joinForSpeech(["Am, is veya", "are", "'ı seçeriz."]), "Am, is veya are'ı seçeriz."],
  ["noktalama yapışır", joinForSpeech(["Today we learn about", "am, is and are", ". Ready?"]), "Today we learn about am, is and are. Ready?"],
  ["normal boşluk", joinForSpeech(["Boşluğu doldur:", "Hi, … name is Omar."]), "Boşluğu doldur: Hi, … name is Omar."],
  ["açılış işareti", joinForSpeech(["Lo correcto es:", "¿", "Where are you?"]), "Lo correcto es: ¿Where are you?"],
  ["boş parça atlanır", joinForSpeech(["Tam isabet!", "  ", ""]), "Tam isabet!"],
  // Satır arası → paragraf arası: yönerge + İngilizce madde, şıklar (5 Kas 2026)
  ["satır sonu korunur", speakableText("Cümledeki boşluğu doldur:\n\n"), "Cümledeki boşluğu doldur:\n"],
  ["satır başı korunur", speakableText("\nA) I have tried sushi."), "\nA) I have tried sushi."],
  ["yönerge sonrası paragraf",
    joinForSpeech([speakableText("Cümledeki boşluğu doldur:\n\n"), speakableText("When I arrived, ___ already started.")]),
    "Cümledeki boşluğu doldur:\n\nWhen I arrived, … already started."],
  ["şıklar ayrı paragraf",
    joinForSpeech(["Aşağıdakilerden hangisi doğru?\n\n", "", "\nA) I tried sushi.", "\nB) I have tried sushi."]),
    "Aşağıdakilerden hangisi doğru?\n\nA) I tried sushi.\n\nB) I have tried sushi."],
];

let fail = 0;
for (const [label, got, want] of cases) {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${ok ? "" : ` — ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`}`);
}
console.log(fail ? `❌ ${fail} başarısız` : `✅ ${cases.length} geçti`);
process.exit(fail ? 1 : 0);

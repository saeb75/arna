/**
 * CHROME SES KONTROLÜ — dil paketindeki SESLE OKUNAN her sabit cümle (alıştırma
 * yönergeleri, geçişler, övgüler, kapanış) AKTİF sesle, ÜRETİMDEKİ gateway üzerinden
 * okunur; ana dil kısmı kesilip dil algılamalı Whisper'a verilir. Ana dil olarak
 * algılanmayan ya da metni tutmayan satır başarısızdır (çıkış kodu 1).
 *
 *   cd apps/backend && set -a && source .env && set +a && npx tsx scripts/tts-chrome-probe.ts
 *   seçenekler: --lang=tr (chrome paketi)
 *
 * NEDEN (4 Kas 2026): çok dilli İngilizce ses 1-2 kelimelik Türkçeyi İngilizce okudu
 * ("Boşluğu doldur" → "Bush Lou Dolder", "Tam isabet!" → "Tommy Sabat"); uzun cümleler
 * doğru. Chrome metni değişince ya da ses değişince bu betik koşulur — "düzelt, başka
 * yerde boz" döngüsünü ölçümle kapatmak için.
 *
 * SINIR: Whisper'ın dil algısı telaffuzun vekilidir (kulak değil). macOS `afconvert`
 * gerekir (mp3 çözümü). Ad gibi özel isimler ("Saeb") ölçüme girmez.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toFile } from "openai";
import { getChrome } from "../src/i18n/index.js";
import { languageName } from "../src/lib/language.js";
import { openaiClient } from "../src/modules/llm/openai.js";
import { resolveActiveTts, resolveLanguage, synthesizeRunsToClips } from "../src/modules/tts/index.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
) as Record<string, string>;

const LANG = args.lang ?? "tr";
const RATE = 24_000;
const ITEM = "My brother ___ a doctor.";
const WORK = mkdtempSync(join(tmpdir(), "chrome-probe-"));

function pcmOf(mp3: Buffer, name: string): Buffer {
  writeFileSync(join(WORK, `${name}.mp3`), mp3);
  execFileSync("afconvert", ["-f", "WAVE", "-d", `LEI16@${RATE}`, "-c", "1", join(WORK, `${name}.mp3`), join(WORK, `${name}.wav`)]);
  const wav = readFileSync(join(WORK, `${name}.wav`));
  const d = wav.indexOf("data");
  return wav.subarray(d + 8, d + 8 + wav.readUInt32LE(d + 4));
}

function wav(pcm: Buffer): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0, "ascii");
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVEfmt ", 8, "ascii");
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36, "ascii");
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function whisper(pcm: Buffer): Promise<{ lang: string; text: string }> {
  const r = (await openaiClient.audio.transcriptions.create({
    file: await toFile(wav(pcm), "s.wav", { type: "audio/wav" }),
    model: "whisper-1",
    response_format: "verbose_json",
  })) as unknown as { language?: string; text?: string };
  return { lang: String(r.language ?? "?"), text: String(r.text ?? "").trim() };
}

const norm = (t: string) => t.toLocaleLowerCase(LANG).replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();

/** Ana dil olarak algılandı ve kelimelerin çoğu tuttu mu */
function passes(want: string, got: { lang: string; text: string }, expectedLang: string): boolean {
  const w = norm(want).split(" ").filter(Boolean);
  const g = new Set(norm(got.text).split(" "));
  return got.lang === expectedLang && w.filter((x) => g.has(x)).length / w.length >= 0.6;
}

async function main() {
  const chrome = getChrome(LANG);
  const active = await resolveActiveTts();
  const l1Code = await resolveLanguage(active, LANG);
  const enCode = await resolveLanguage(active, "en");
  if (!l1Code || !enCode) throw new Error(`aktif ses ${LANG}/en kapsamıyor`);
  // Whisper dil adı İngilizce küçük harf ("turkish") — languageName'in İngilizce karşılığı
  const expectedLang = new Intl.DisplayNames(["en"], { type: "language" }).of(LANG)!.toLowerCase();
  console.log(`aktif ses: ${active.provider.name} · ${active.voiceId} · ${active.modelId} · paket ${LANG} (${languageName(LANG)})\n`);

  const s = chrome.script;
  // Yönergeler İngilizce maddeyle birlikte okunur (üretimdeki gibi); diğerleri tek başına
  const withItem = [chrome.labels.exerciseFillBlank, chrome.labels.exerciseMcq, chrome.labels.exerciseSaySentence];
  // Selamlamanın ana dil parçaları — ders adı ({topic}) İngilizce `en` parçasıdır, ölçüme girmez
  const greetingParts = s.greeting
    .split("{topic}")
    .map((p) => p.replace("{name}", "Ayşe").replace(/\{\w+\}/g, "").replace(/^[\s.,!?]+/, "").trim())
    .filter((p) => /\p{L}/u.test(p));
  const alone = [
    ...greetingParts,
    s.teachIntro, s.askQuestions, s.exercisesAnnounce, s.practiceIntro.replace(/\{\w+\}/g, "").trim(),
    s.inviteQuestion, ...s.praise, s.wrapup.replace(/\{\w+\}/g, "").trim(), s.farewell,
  ];

  let fail = 0;
  for (const [i, label] of withItem.entries()) {
    const [clip] = await synthesizeRunsToClips(active, [{ languageCode: l1Code, text: label }, { languageCode: enCode, text: ITEM }]);
    const pcm = pcmOf(Buffer.from(clip!.audioBase64, "base64"), `label-${i}`);
    // Hizalamadan ana dil kısmının sonu: etiketteki harf sayısı kadar harf
    const a = clip!.alignment;
    const letters = label.replace(/[^\p{L}\p{N}]/gu, "").length;
    let seen = 0;
    let end = pcm.length / 2 / RATE;
    if (a) {
      for (let k = 0; k < a.characters.length; k++) {
        if (/[\p{L}\p{N}]/u.test(a.characters[k]!)) seen++;
        if (seen === letters) {
          end = a.character_end_times_seconds[k]! + 0.06;
          break;
        }
      }
    }
    const got = await whisper(pcm.subarray(0, Math.ceil(end * RATE) * 2));
    const ok = passes(label, got, expectedLang);
    if (!ok) fail++;
    console.log(`${ok ? "✅" : "❌"} yönerge «${label}» → [${got.lang}] ${got.text}`);
  }
  for (const [i, line] of alone.entries()) {
    const [clip] = await synthesizeRunsToClips(active, [{ languageCode: l1Code, text: line }]);
    const got = await whisper(pcmOf(Buffer.from(clip!.audioBase64, "base64"), `line-${i}`));
    const ok = passes(line, got, expectedLang);
    if (!ok) fail++;
    console.log(`${ok ? "✅" : "❌"} cümle «${line}» → [${got.lang}] ${got.text}`);
  }
  console.log(fail ? `\n❌ ${fail} satır ana dilde okunmadı — metni uzatıp yeniden ölç` : `\n✅ ${withItem.length + alone.length} satırın hepsi ana dilde okundu`);
  process.exit(fail ? 1 : 0);
}

await main();

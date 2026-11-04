/**
 * TTS DİL SONDASI — alıştırma yönergesi gibi KISA ana-dil parçası ("Boşluğu doldur:")
 * ve ardından gelen İngilizce madde, hangi Azure sesiyle DOĞRU dilde okunuyor?
 * Kulakla değil ölçümle: üretimdeki SSML (`buildSsml`, her grup <lang>) okutulur,
 * Azure kelime sınırlarıyla L1 ve EN bölümleri kesilir, her bölüm dil algılamalı
 * Whisper'a verilir. L1 bölümü ana dil olarak algılanıp doğru yazılıyorsa telaffuz
 * o dildedir; İngilizce algılanıyorsa ses o parçayı İngilizce okumuştur.
 *
 *   cd apps/backend && set -a && source .env && set +a && npx tsx scripts/tts-lang-probe.ts
 *   seçenekler: --voices=<virgüllü Azure ses adları> --lang=tr|es
 *
 * Neden (4 Kas 2026): canlıda "Boşluğu doldur" İngilizce aksanla okundu; aktif ses
 * admin'de en-US-Ava:DragonHDLatestNeural'a çevrilmişti. Ses seçimi bu ölçümle
 * (ve kulak testiyle) yapılır, tahminle değil.
 *
 * SINIR: Whisper'ın dil algısı telaffuzun vekilidir, kulak değildir. Kelime sınırı
 * vermeyen seslerde (MAI) bölüm kesilemez — tüm klip tek parça ölçülür.
 */
import sdk from "microsoft-cognitiveservices-speech-sdk";
import { toFile } from "openai";
import { buildSsml } from "../src/modules/tts/azure.js";
import { joinForSpeech, speakableText } from "../src/modules/tts/speakable.js";
import { openaiClient } from "../src/modules/llm/openai.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
) as Record<string, string>;

type Run = { lang: "l1" | "en"; text: string };
const L1 = (args.lang ?? "tr") as "tr" | "es";
const L1_LOCALE = { tr: "tr-TR", es: "es-ES" }[L1];

/** Üretimdeki görev metinleri: chrome yönergesi (l1) + İngilizce madde (en) */
const PROMPTS: Record<"tr" | "es", Run[][]> = {
  tr: [
    [{ lang: "l1", text: "Boşluğu doldur:" }, { lang: "en", text: "Hi, ___ name is Omar." }],
    [{ lang: "l1", text: "Hangisi doğru?" }, { lang: "en", text: "Which sentence is correct? A) We is in the same class. B) We are in the same class." }],
    [{ lang: "l1", text: "Cümlenin tamamını söyle:" }, { lang: "en", text: "hello / my name is / Ana" }],
  ],
  es: [
    [{ lang: "l1", text: "Completa el hueco:" }, { lang: "en", text: "Hi, ___ name is Omar." }],
    [{ lang: "l1", text: "¿Cuál es la correcta?" }, { lang: "en", text: "Which sentence is correct? A) We is in the same class. B) We are in the same class." }],
  ],
};

const VOICES = (
  args.voices ??
  [
    "en-US-Ava:DragonHDLatestNeural", // canlıdaki (admin 3 Kas)
    "en-US-AvaMultilingualNeural", // kodun kurgulandığı çok dilli ses
    "en-us-ava:DragonHDOmniLatestNeural",
    L1 === "tr" ? "tr-TR-Ahmet:DragonLatestNeural" : "es-ES-XimenaMultilingualNeural",
    L1 === "tr" ? "tr-TR-Elif:MAI-Voice-2.1" : "es-ES-Marta:MAI-Voice-2.1",
  ].join(",")
).split(",");

const RATE = 24_000;

interface Word {
  text: string;
  start: number;
  end: number;
}

async function synth(ssml: string): Promise<{ pcm: Buffer; words: Word[] }> {
  const config = sdk.SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY!, process.env.AZURE_SPEECH_REGION!);
  config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Raw24Khz16BitMonoPcm;
  config.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestWordBoundary, "true");
  const synth = new sdk.SpeechSynthesizer(config, null as unknown as sdk.AudioConfig);
  const words: Word[] = [];
  synth.wordBoundary = (_s, e) => {
    if (e.boundaryType !== sdk.SpeechSynthesisBoundaryType.Word) return;
    words.push({ text: e.text, start: e.audioOffset / 1e7, end: (e.audioOffset + e.duration) / 1e7 });
  };
  try {
    const result = await new Promise<sdk.SpeechSynthesisResult>((ok, fail) => synth.speakSsmlAsync(ssml, ok, (e) => fail(new Error(String(e)))));
    if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) throw new Error((result.errorDetails ?? String(result.reason)).slice(0, 160));
    return { pcm: Buffer.from(result.audioData), words };
  } finally {
    synth.close();
  }
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

const slice = (pcm: Buffer, from: number, to: number) => {
  const a = Math.max(0, Math.floor(from * RATE)) * 2;
  const b = Math.min(pcm.length, Math.ceil(to * RATE) * 2);
  return pcm.subarray(a, b);
};

async function whisper(pcm: Buffer): Promise<{ language: string; text: string }> {
  const r = (await openaiClient.audio.transcriptions.create({
    file: await toFile(wav(pcm), "seg.wav", { type: "audio/wav" }),
    model: "whisper-1",
    response_format: "verbose_json",
  })) as unknown as { language?: string; text?: string };
  return { language: r.language ?? "?", text: (r.text ?? "").trim() };
}

const wordCount = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/** Karakter hizalamalı sağlayıcılar (ElevenLabs, Inworld): tam cümle tek istek */
interface CharSynth {
  name: string;
  run: (text: string, l1Text: string) => Promise<{ pcm: Buffer; chars: string[]; starts: number[]; ends: number[] }>;
}

const CHAR_PROVIDERS: CharSynth[] = [
  ...(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID
    ? ["eleven_v3", "eleven_multilingual_v2", "eleven_flash_v2_5"].map((model) => ({
        name: `ElevenLabs ${model} · tam cümle, dil zorlamasız`,
        run: async (text: string) => {
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVENLABS_VOICE_ID!)}/with-timestamps?output_format=pcm_24000`,
            {
              method: "POST",
              headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "content-type": "application/json" },
              body: JSON.stringify({ text, model_id: model }),
            },
          );
          if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
          const d = (await res.json()) as {
            audio_base64: string;
            alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
          };
          return { pcm: Buffer.from(d.audio_base64, "base64"), chars: d.alignment.characters, starts: d.alignment.character_start_times_seconds, ends: d.alignment.character_end_times_seconds };
        },
      }))
    : []),
  ...(process.env.INWORLD_API_KEY
    ? [
        {
          name: "Inworld inworld-tts-2 · <lang> etiketli + candidates",
          run: async (text: string, l1Text: string) => {
            const en = text.slice(l1Text.length).trim();
            const res = await fetch("https://api.inworld.ai/tts/v1/voice", {
              method: "POST",
              headers: { authorization: `Basic ${process.env.INWORLD_API_KEY}`, "content-type": "application/json" },
              body: JSON.stringify({
                text: `<lang lang="${L1_LOCALE}">${l1Text}</lang> <lang lang="en-US">${en}</lang>`,
                voiceId: process.env.INWORLD_VOICE_ID,
                modelId: "inworld-tts-2",
                audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: RATE },
                timestampType: "CHARACTER",
                languageSettings: { candidates: [L1_LOCALE, "en-US"] },
              }),
            });
            if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
            const d = (await res.json()) as {
              audioContent: string;
              timestampInfo?: { characterAlignment?: { characters: string[]; characterStartTimeSeconds: number[]; characterEndTimeSeconds: number[] } };
            };
            let pcm = Buffer.from(d.audioContent, "base64");
            if (pcm.toString("ascii", 0, 4) === "RIFF") pcm = pcm.subarray(44); // LINEAR16 WAV başlığı
            const a = d.timestampInfo?.characterAlignment;
            return { pcm, chars: a?.characters ?? [], starts: a?.characterStartTimeSeconds ?? [], ends: a?.characterEndTimeSeconds ?? [] };
          },
        },
      ]
    : []),
];

/** Hizalamadaki karakterlerden L1 önekinin bitişi ve İngilizcenin başlangıcı (sn) */
function charSplit(chars: string[], starts: number[], ends: number[], l1Text: string): { l1End: number; enStart: number } | null {
  const letters = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");
  const want = letters(l1Text).length;
  let seen = 0;
  for (let i = 0; i < chars.length; i++) {
    if (/[\p{L}\p{N}]/u.test(chars[i]!)) seen++;
    if (seen === want) {
      const next = chars.findIndex((c, j) => j > i && /[\p{L}\p{N}]/u.test(c));
      if (next < 0) return null;
      return { l1End: ends[i]! + 0.06, enStart: Math.max(ends[i]! + 0.06, starts[next]! - 0.04) };
    }
  }
  return null;
}

async function main() {
  console.log(`Dil sondası — ana dil ${L1}, ${VOICES.length} Azure sesi + ${CHAR_PROVIDERS.length} diğer × ${PROMPTS[L1].length} görev\n`);
  for (const p of args.voices && !args.all ? [] : CHAR_PROVIDERS) {
    console.log(`■ ${p.name}`);
    for (const runs of PROMPTS[L1]) {
      const l1Text = runs[0]!.text;
      const text = speakableText(joinForSpeech(runs.map((r) => r.text)));
      try {
        const out = await p.run(text, l1Text);
        const cut = charSplit(out.chars, out.starts, out.ends, l1Text);
        if (!cut) {
          const all = await whisper(out.pcm);
          console.log(`  «${l1Text}» → (hizalama yok, tüm klip) [${all.language}] ${JSON.stringify(all.text.slice(0, 80))}`);
          continue;
        }
        const [a, b] = await Promise.all([whisper(slice(out.pcm, 0, cut.l1End)), whisper(slice(out.pcm, cut.enStart, out.pcm.length / 2 / RATE))]);
        console.log(`  «${l1Text}» → [${a.language}] ${JSON.stringify(a.text)}   |   EN → [${b.language}] ${JSON.stringify(b.text.slice(0, 50))}`);
      } catch (err) {
        console.log(`  «${l1Text}» → HATA: ${(err as Error).message}`);
      }
    }
    console.log("");
  }
  for (const voice of VOICES) {
    console.log(`■ ${voice}`);
    for (const runs of PROMPTS[L1]) {
      const coded = runs.map((r) => ({ languageCode: r.lang === "en" ? "en-US" : L1_LOCALE, text: speakableText(r.text) }));
      try {
        const { pcm, words } = await synth(buildSsml(coded, voice));
        const n = wordCount(runs[0]!.text);
        if (words.length > n) {
          const l1End = words[n - 1]!.end + 0.06;
          const enStart = Math.max(l1End, words[n]!.start - 0.04);
          const [a, b] = await Promise.all([whisper(slice(pcm, 0, l1End)), whisper(slice(pcm, enStart, pcm.length / 2 / RATE))]);
          console.log(`  «${runs[0]!.text}» → [${a.language}] ${JSON.stringify(a.text)}   |   EN → [${b.language}] ${JSON.stringify(b.text.slice(0, 50))}`);
        } else {
          const all = await whisper(pcm);
          console.log(`  «${runs[0]!.text}» → (kelime sınırı yok, tüm klip) [${all.language}] ${JSON.stringify(all.text.slice(0, 80))}`);
        }
      } catch (err) {
        console.log(`  «${runs[0]!.text}» → HATA: ${(err as Error).message}`);
      }
    }
    console.log("");
  }
}

await main();

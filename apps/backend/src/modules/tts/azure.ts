import sdk from "microsoft-cognitiveservices-speech-sdk";
import { env } from "../../config/env.js";
import {
  TtsError,
  type CharAlignment,
  type SynthesizeResult,
  type SynthesizeRunsRequest,
  type TtsProvider,
  type TtsRun,
} from "./types.js";

/**
 * Azure Speech (Neural TTS) — learn.microsoft.com/azure/ai-services/speech-service (2026-09):
 *   · ÇOK DİLLİ TEK KLİP: çok dilli sesler (`en-US-AvaMultilingualNeural` …) tek SSML
 *     içinde `<lang xml:lang="en-US">` ile dil değiştirir → bir speak çağrısının tüm
 *     parçaları TEK istek, TEK ses, TEK alignment. Kullanıcı test etti, prosodi kopmuyor.
 *   · `<lang>` yalnız çok dilli seslerde çalışır ve TAM locale ister (`tr-TR`; `tr` yetmez).
 *     Ses o dili konuşamıyorsa ses üretilmez → `coverage()` ses listesinden kapsam çeker.
 *   · FATURA: `<speak>`/`<voice>` hariç TÜM işaretleme karakter sayılır — bu yüzden
 *     kök `xml:lang` en çok karakteri olan dil olur, yalnız DİĞER diller `<lang>` ile
 *     sarılır, SSML girintisiz üretilir, ardışık aynı-dil parçalar tek blokta.
 *   · Zaman damgası REST'te YOK; Speech SDK `wordBoundary` olayları (tick = 100 ns)
 *     karakter bazlı istemci biçimine çevrilir. Viseme/blendshape yolu (55 ARKit
 *     benzeri, yalnız en-US) sonraki faz.
 *   · Çıktı `Audio24Khz48KBitRateMonoMp3` → istemci `audio/mpeg` sözleşmesi aynen.
 */
export const AZURE_MODELS = ["neural"] as const;
export const AZURE_DEFAULT_VOICE = "en-US-AvaMultilingualNeural";
const REQUEST_TIMEOUT_MS = 30_000;
const VOICE_LIST_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Normalize kod → Azure locale, DİL TABLOSU OLMADAN: `Intl.Locale.maximize()`
 * olası bölgeyi türetir (`tr→tr-TR`, `zh-hans→zh-CN`, `pt-br→pt-BR`, `ar→ar-EG`).
 * Sesin listesinde birebir yoksa gateway aynı dilli başka locale'e düşer.
 */
export function azureLocale(normalized: string): string | null {
  const code = normalized.trim();
  if (!/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(code)) return null;
  try {
    const max = new Intl.Locale(code).maximize();
    return max.region ? `${max.language}-${max.region}` : max.language;
  } catch {
    return null;
  }
}

export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&apos;",
  );
}

/** En çok karaktere sahip dil kök olur → en az `<lang>` sarmalı, en az fatura */
export function dominantLocale(runs: TtsRun[]): string {
  const total = new Map<string, number>();
  for (const r of runs) total.set(r.languageCode, (total.get(r.languageCode) ?? 0) + r.text.length);
  let best = runs[0]?.languageCode ?? "en-US";
  let bestN = -1;
  for (const [code, n] of total) {
    if (n > bestN) {
      best = code;
      bestN = n;
    }
  }
  return best;
}

/** Ardışık aynı-dil parçaları birleştirir (tek `<lang>` bloğu, daha doğal prosodi) */
export function mergeRuns(runs: TtsRun[]): TtsRun[] {
  const out: TtsRun[] = [];
  for (const r of runs) {
    const prev = out[out.length - 1];
    if (prev && prev.languageCode === r.languageCode) prev.text += ` ${r.text}`;
    else out.push({ ...r });
  }
  return out;
}

/** Girintisiz, kaçışlı SSML; kök dil sarılmaz, diğerleri `<lang>` ile */
export function buildSsml(runs: TtsRun[], voiceId: string, rootLocale = dominantLocale(runs)): string {
  const body = mergeRuns(runs)
    .map((g) =>
      g.languageCode === rootLocale
        ? escapeXml(g.text)
        : `<lang xml:lang="${escapeXml(g.languageCode)}">${escapeXml(g.text)}</lang>`,
    )
    .join(" ");
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${escapeXml(rootLocale)}">` +
    `<voice name="${escapeXml(voiceId)}">${body}</voice></speak>`
  );
}

export interface WordBoundary {
  text: string;
  /** tick (100 ns) — SDK ham değeri */
  audioOffsetTicks: number;
  durationTicks: number;
  kind: "word" | "punctuation" | "sentence";
}

/**
 * Kelime sınırı olayları → istemci karakter biçimi. Kelime karakterleri kendi
 * penceresine eşit paylaştırılır; kelimeler arasına bir boşluk karakteri girer
 * (istemci `alignment.ts` kelimeleri boşluktan ayırır), noktalama boşluksuz
 * önceki kelimeye yaslanır. Cümle olayları tüm cümle metnini taşıdığı için atlanır.
 */
export function wordBoundariesToAlignment(events: WordBoundary[]): CharAlignment | null {
  const evs = events
    .filter((e) => e.kind !== "sentence" && e.text.length > 0)
    .sort((a, b) => a.audioOffsetTicks - b.audioOffsetTicks);
  if (evs.length === 0) return null;

  const characters: string[] = [];
  const starts: number[] = [];
  const ends: number[] = [];
  let prevEnd = 0;
  evs.forEach((e, idx) => {
    const start = Math.max(e.audioOffsetTicks / 1e7, prevEnd);
    const end = start + Math.max(e.durationTicks, 0) / 1e7;
    if (idx > 0 && e.kind === "word") {
      characters.push(" ");
      starts.push(prevEnd);
      ends.push(start);
    }
    const n = e.text.length;
    for (let i = 0; i < n; i++) {
      characters.push(e.text[i]!);
      starts.push(start + ((end - start) * i) / n);
      ends.push(start + ((end - start) * (i + 1)) / n);
    }
    prevEnd = end;
  });
  return { characters, character_start_times_seconds: starts, character_end_times_seconds: ends };
}

function boundaryKind(t: sdk.SpeechSynthesisBoundaryType): WordBoundary["kind"] {
  if (t === sdk.SpeechSynthesisBoundaryType.Punctuation) return "punctuation";
  if (t === sdk.SpeechSynthesisBoundaryType.Sentence) return "sentence";
  return "word";
}

function withTimeout<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new TtsError("tts_unavailable", `${what} ${ms} ms içinde cevap vermedi`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

// --- Ses listesi (kapsam) — bölge başına 24 saat önbellek ---------------------

interface VoiceListEntry {
  ShortName: string;
  Locale: string;
  SecondaryLocaleList?: string[];
}
let voiceList: { region: string; at: number; voices: VoiceListEntry[] } | null = null;

async function fetchVoiceList(): Promise<VoiceListEntry[] | null> {
  const region = env.AZURE_SPEECH_REGION!;
  if (voiceList && voiceList.region === region && Date.now() - voiceList.at < VOICE_LIST_TTL_MS) return voiceList.voices;
  try {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
      headers: { "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY! },
    });
    if (!res.ok) {
      console.warn(`[tts/azure] ses listesi alınamadı (${res.status}) — kapsam denetimi atlanıyor`);
      return null;
    }
    const voices = (await res.json()) as VoiceListEntry[];
    voiceList = { region, at: Date.now(), voices };
    return voices;
  } catch (err) {
    console.warn(`[tts/azure] ses listesi hatası — kapsam denetimi atlanıyor: ${(err as Error).message}`);
    return null;
  }
}

export const azureProvider: TtsProvider = {
  name: "azure",
  models: AZURE_MODELS,
  configured: () => Boolean(env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION),
  defaultVoiceId: () => env.AZURE_SPEECH_VOICE ?? AZURE_DEFAULT_VOICE,
  languageCode: azureLocale,

  async coverage(voiceId) {
    const voices = await fetchVoiceList();
    if (!voices) return null;
    const v = voices.find((x) => x.ShortName.toLowerCase() === voiceId.toLowerCase());
    if (!v) return null; // özel/bilinmeyen ses: iyimser davran
    return new Set([v.Locale, ...(v.SecondaryLocaleList ?? [])]);
  },

  synthesize(req) {
    return this.synthesizeRuns!({ runs: [{ languageCode: req.languageCode, text: req.text }], voiceId: req.voiceId, modelId: req.modelId });
  },

  async synthesizeRuns({ runs, voiceId }: SynthesizeRunsRequest): Promise<SynthesizeResult> {
    const ssml = buildSsml(runs, voiceId);
    const config = sdk.SpeechConfig.fromSubscription(env.AZURE_SPEECH_KEY!, env.AZURE_SPEECH_REGION!);
    config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
    config.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary, "false");
    config.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestWordBoundary, "true");

    // AudioConfig `null`: ses hoparlöre değil belleğe (result.audioData) — Node'da tek geçerli yol
    const synth = new sdk.SpeechSynthesizer(config, null);
    const events: WordBoundary[] = [];
    synth.wordBoundary = (_s, e) => {
      events.push({ text: e.text, audioOffsetTicks: e.audioOffset, durationTicks: e.duration, kind: boundaryKind(e.boundaryType) });
    };

    try {
      const result = await withTimeout(
        new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
          synth.speakSsmlAsync(ssml, resolve, (err) => reject(new TtsError("tts_unavailable", `Azure hata: ${String(err).slice(0, 200)}`)));
        }),
        REQUEST_TIMEOUT_MS,
        "Azure Speech",
      );
      if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
        throw new TtsError("tts_unavailable", `Azure hata: ${(result.errorDetails ?? String(result.reason)).slice(0, 200)}`);
      }
      const audioBase64 = Buffer.from(result.audioData).toString("base64");
      if (!audioBase64) throw new TtsError("tts_unavailable", "Azure boş ses döndürdü (ses bu dili konuşamıyor olabilir)");
      return { audioBase64, alignment: wordBoundariesToAlignment(events) };
    } finally {
      synth.close();
    }
  },
};

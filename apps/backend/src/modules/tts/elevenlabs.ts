import { env } from "../../config/env.js";
import { TtsError, type CharAlignment, type SynthesizeResult, type TtsProvider } from "./types.js";
import { joinForSpeech } from "./speakable.js";

/**
 * ElevenLabs flash v2.5 ISO-639-1 kapsaması (~32 dil). Kapsam dışı bir ana dil
 * gelirse `null` döner: çağıran L1 parçalarını SESSİZ bırakır (metin ekranda),
 * yalnız İngilizce parçaları okur — anlaşılmaz telaffuz üretmekten iyidir.
 */
const LANG: Record<string, string> = {
  en: "en", tr: "tr", ar: "ar", "zh-hans": "zh", "zh-hant": "zh", es: "es", de: "de",
  fr: "fr", it: "it", "pt-br": "pt", "pt-pt": "pt", pl: "pl", hi: "hi", ja: "ja",
  ko: "ko", nl: "nl", ru: "ru", sv: "sv", id: "id", fil: "fil", uk: "uk", el: "el",
  cs: "cs", fi: "fi", ro: "ro", da: "da", bg: "bg", ms: "ms", sk: "sk", hr: "hr",
  ta: "ta", vi: "vi", no: "no", hu: "hu",
};

/** v3 TTS ucunda çalışır (v4 yalnız Text-to-Dialogue — ayrı faz) */
export const ELEVENLABS_MODELS = ["eleven_flash_v2_5", "eleven_turbo_v2_5", "eleven_multilingual_v2", "eleven_v3"] as const;

/** `language_code` bu modelde desteklenmiyor (dokümana göre) — gönderilirse istek reddedilebilir */
const NO_LANGUAGE_CODE = new Set(["eleven_multilingual_v2"]);

/**
 * `with-timestamps` ucu: ses + karakter zamanlamaları tek cevapta. Bu biçim
 * istemci sözleşmesinin kendisi olduğundan dönüşüm yok; `normalized_alignment`
 * (sayı/kısaltma açılmış metin) varsa o, yoksa `alignment`.
 */
async function withTimestamps(body: Record<string, unknown>, voiceId: string): Promise<SynthesizeResult> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": env.ELEVENLABS_API_KEY!, "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new TtsError("tts_unavailable", `ElevenLabs hata (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    audio_base64: string;
    alignment?: unknown;
    normalized_alignment?: unknown;
  };
  const alignment = (data.normalized_alignment ?? data.alignment ?? null) as CharAlignment | null;
  return { audioBase64: data.audio_base64, alignment };
}

export const elevenlabsProvider: TtsProvider = {
  name: "elevenlabs",
  models: ELEVENLABS_MODELS,
  configured: () => Boolean(env.ELEVENLABS_API_KEY),
  defaultVoiceId: () => env.ELEVENLABS_VOICE_ID ?? null,
  languageCode: (normalized) => LANG[normalized] ?? null,

  /** Tek dilli metin (panel önizlemesi) — dil, destekleyen modelde zorlanır */
  async synthesize({ text, languageCode, voiceId, modelId }) {
    return withTimestamps(
      { text, model_id: modelId, ...(NO_LANGUAGE_CODE.has(modelId) ? {} : { language_code: languageCode }) },
      voiceId,
    );
  },

  /**
   * TAM CÜMLE — bir speak çağrısının bütün parçaları (ana dil + İngilizce) TEK metin,
   * TEK istek, `language_code` YOK: model dili cümlenin içinde kendisi değiştirir.
   *
   * Eskiden cümle dile göre bölünüp her parça `language_code` ile AYRI klip
   * okutuluyordu — model tek dile zorlanıyor, prosodi kopuyordu; "ElevenLabs
   * Türkçeyle İngilizceyi birlikte söyleyemiyor" izlenimi buradan doğdu. 4 Kas 2026
   * dil sondası (`scripts/tts-lang-probe.ts`): tam cümlede flash v2.5, multilingual
   * v2 ve v3'ün üçü de "Boşluğu doldur:" yönergesini Türkçe, ardından gelen maddeyi
   * İngilizce okudu (Azure Ava seslerinin üçü de İngilizce okudu).
   */
  async synthesizeRuns({ runs, voiceId, modelId }) {
    return withTimestamps({ text: joinForSpeech(runs.map((r) => r.text)), model_id: modelId }, voiceId);
  },
};

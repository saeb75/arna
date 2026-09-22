import { env } from "../../config/env.js";
import { TtsError, type TtsProvider } from "./types.js";

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

export const ELEVENLABS_MODELS = ["eleven_flash_v2_5", "eleven_turbo_v2_5", "eleven_multilingual_v2"] as const;

/**
 * `with-timestamps` ucu: ses + karakter zamanlamaları tek cevapta. Bu biçim
 * istemci sözleşmesinin kendisi olduğundan dönüşüm yok; `normalized_alignment`
 * (sayı/kısaltma açılmış metin) varsa o, yoksa `alignment`.
 */
export const elevenlabsProvider: TtsProvider = {
  name: "elevenlabs",
  models: ELEVENLABS_MODELS,
  configured: () => Boolean(env.ELEVENLABS_API_KEY),
  defaultVoiceId: () => env.ELEVENLABS_VOICE_ID ?? null,
  languageCode: (normalized) => LANG[normalized] ?? null,

  async synthesize({ text, languageCode, voiceId, modelId }) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": env.ELEVENLABS_API_KEY!, "content-type": "application/json" },
        body: JSON.stringify({ text, model_id: modelId, language_code: languageCode }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new TtsError("tts_unavailable", `ElevenLabs hata (${res.status}): ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      audio_base64: string;
      alignment?: unknown;
      normalized_alignment?: unknown;
    };
    const alignment = (data.normalized_alignment ?? data.alignment ?? null) as
      | { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] }
      | null;
    return { audioBase64: data.audio_base64, alignment };
  },
};

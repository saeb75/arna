import { z } from "zod";
import { env } from "../../config/env.js";
import { TtsError, type CharAlignment, type TtsProvider } from "./types.js";

/**
 * Inworld Realtime TTS-2 — docs.inworld.ai/tts (llms.txt ile çekildi):
 *   · Kimlik `Authorization: Basic <portal'dan kopyalanan base64>` — tekrar kodlanmaz.
 *   · `POST https://api.inworld.ai/tts/v1/voice` (stream'siz; ≤2.000 karakter —
 *     gateway grupları 600'de kestiği için tavanın altında).
 *   · `timestampType: "CHARACTER"` → `timestampInfo.characterAlignment`
 *     {characters, characterStartTimeSeconds, characterEndTimeSeconds}: ElevenLabs
 *     biçimine bire bir çevrilir, istemci hiç değişmez. WORD modu fonem+viseme
 *     de verir; o ayrı faz (alignment.ts/viseme.ts'te yeni yol ister).
 *   · `language` BCP-47; 200+ dil → kapsam tablosu yok, kod açılıp geçirilir.
 */
const BASE_URL = "https://api.inworld.ai";

export const INWORLD_MODELS = ["inworld-tts-2-flash", "inworld-tts-2"] as const;

/**
 * `lib/language.ts` normalize biçimi küçük harf ve alfabe/bölge alt etiketini
 * KORUR (`zh-hans`, `pt-br`, `sr-latn`). Inworld BCP-47 bekler; yalnız bu
 * alt etiketli kodlar açılır, geri kalanı (`tr`, `ar`, `sw`) olduğu gibi gider.
 */
const BCP47: Record<string, string> = {
  "zh-hans": "zh-CN",
  "zh-hant": "zh-TW",
  "pt-br": "pt-BR",
  "pt-pt": "pt-PT",
  "sr-latn": "sr-Latn",
  "sr-cyrl": "sr-Cyrl",
};
export function inworldLanguage(normalized: string): string | null {
  const code = normalized.trim().toLowerCase();
  if (!/^[a-z]{2,3}(-[a-z]{2,8})*$/.test(code)) return null;
  return BCP47[code] ?? code;
}

/** Cevap gevşek okunur: ses zorunlu, zaman damgası opsiyonel (gelmezse dudak senkronu düz düşer, ses kesilmez). */
const responseSchema = z
  .object({
    audioContent: z.string().min(1),
    timestampInfo: z
      .object({
        characterAlignment: z
          .object({
            characters: z.array(z.string()),
            characterStartTimeSeconds: z.array(z.number()),
            characterEndTimeSeconds: z.array(z.number()),
          })
          .partial()
          .nullish(),
      })
      .partial()
      .nullish(),
  })
  .passthrough();

/**
 * Inworld karakter dizileri → istemci sözleşmesi. Üç dizi eşit uzunlukta
 * değilse alignment GÜVENİLMEZ sayılır ve `null` döner: yanlış zamanlamayla
 * oynayan bir çene, oynamayan çeneden kötüdür.
 */
export function toCharAlignment(
  a: { characters?: string[]; characterStartTimeSeconds?: number[]; characterEndTimeSeconds?: number[] } | null | undefined,
): CharAlignment | null {
  if (!a?.characters?.length || !a.characterStartTimeSeconds || !a.characterEndTimeSeconds) return null;
  const n = a.characters.length;
  if (a.characterStartTimeSeconds.length !== n || a.characterEndTimeSeconds.length !== n) return null;
  return {
    characters: a.characters,
    character_start_times_seconds: a.characterStartTimeSeconds,
    character_end_times_seconds: a.characterEndTimeSeconds,
  };
}

export const inworldProvider: TtsProvider = {
  name: "inworld",
  models: INWORLD_MODELS,
  configured: () => Boolean(env.INWORLD_API_KEY),
  defaultVoiceId: () => env.INWORLD_VOICE_ID ?? null,
  languageCode: inworldLanguage,

  async synthesize({ text, languageCode, voiceId, modelId }) {
    const res = await fetch(`${BASE_URL}/tts/v1/voice`, {
      method: "POST",
      headers: { authorization: `Basic ${env.INWORLD_API_KEY!}`, "content-type": "application/json" },
      body: JSON.stringify({
        text,
        voiceId,
        modelId,
        language: languageCode,
        audioConfig: { audioEncoding: "MP3" },
        timestampType: "CHARACTER",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new TtsError("tts_unavailable", `Inworld hata (${res.status}): ${body.slice(0, 200)}`);
    }
    const parsed = responseSchema.safeParse(await res.json());
    if (!parsed.success) {
      throw new TtsError("tts_unavailable", `Inworld cevabı beklenen biçimde değil: ${parsed.error.issues[0]?.message ?? "?"}`);
    }
    return {
      audioBase64: parsed.data.audioContent,
      alignment: toCharAlignment(parsed.data.timestampInfo?.characterAlignment),
    };
  },
};

import { env } from "../../config/env.js";
import { createMp3Stream, pcmToMp3, wavToPcm } from "./mp3.js";
import { joinForSpeech } from "./speakable.js";
import { TtsError, type SynthesizeResult, type SynthesizeRunsRequest, type TtsProvider } from "./types.js";

/**
 * GOOGLE GEMINI TTS (5 Kas 2026, kullanıcı kararı — kulak testinde Türkçe+İngilizce
 * karışık metni en doğal okuyan ses). Tam cümle TEK istek, dil etiketi YOK: model
 * dili cümlenin içinde kendisi değiştirir (ElevenLabs tam cümle yolu gibi).
 *
 * Çıktı ham 16-bit PCM 24 kHz mono: tam cevapta WAV başlıklı, akışta (SSE) başlıksız
 * `audio/l16` parçaları → sunucuda mp3'e çevrilir (`mp3.ts`), istemci sözleşmesi aynı.
 * Zaman damgası YOK (`timestamps: false`): native 2.5D avatarın ağzı ses enerjisiyle,
 * 3D avatar çenesi seviyeyle oynar.
 *
 * Ölçüm (5 Kas 2026, ~150 karakterlik geri bildirim): tam klip Flash 3,9–4,6 sn,
 * Flash-Lite 2,4 sn; AKIŞTA ilk ses 0,4–0,6 sn (Azure tam klip 1,2 sn) — bu yüzden
 * akış birincil yol. Fiyat token bazlı: ~25 ses tokeni/sn; 31 Ara 2026'ya kadar Flash
 * $9/M, Lite $6/M ses tokeni (1 Oca 2027'de iki katı).
 *
 * Talimat metne YAZILMAZ: "Sıcak bir öğretmen gibi söyle: …" denendiğinde model
 * talimatı da sesli okudu. Üslup sesin kendisinden gelir (panelden ses seçimi).
 */

const API = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 45_000;
const DEFAULT_RATE = 24_000;
const DEFAULT_VOICE = "Kore";

/** İlki varsayılan. Ad listesi API'nin `models` ucundan doğrulandı (5 Kas 2026). */
export const GEMINI_MODELS = [
  "gemini-3.8-flash-tts",
  "gemini-3.8-flash-lite-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-pro-preview-tts",
] as const;

/** 30 hazır ses — hepsi API'de tek tek doğrulandı (5 Kas 2026). `hint` Google'ın tını notu. */
export const GEMINI_VOICES: ReadonlyArray<{ id: string; hint: string }> = [
  { id: "Kore", hint: "Firm" },
  { id: "Aoede", hint: "Breezy" },
  { id: "Leda", hint: "Youthful" },
  { id: "Zephyr", hint: "Bright" },
  { id: "Sulafat", hint: "Warm" },
  { id: "Despina", hint: "Smooth" },
  { id: "Achernar", hint: "Soft" },
  { id: "Callirrhoe", hint: "Easy-going" },
  { id: "Autonoe", hint: "Bright" },
  { id: "Erinome", hint: "Clear" },
  { id: "Laomedeia", hint: "Upbeat" },
  { id: "Gacrux", hint: "Mature" },
  { id: "Pulcherrima", hint: "Forward" },
  { id: "Vindemiatrix", hint: "Gentle" },
  { id: "Puck", hint: "Upbeat" },
  { id: "Charon", hint: "Informative" },
  { id: "Fenrir", hint: "Excitable" },
  { id: "Orus", hint: "Firm" },
  { id: "Enceladus", hint: "Breathy" },
  { id: "Iapetus", hint: "Clear" },
  { id: "Umbriel", hint: "Easy-going" },
  { id: "Algieba", hint: "Smooth" },
  { id: "Algenib", hint: "Gravelly" },
  { id: "Rasalgethi", hint: "Informative" },
  { id: "Alnilam", hint: "Firm" },
  { id: "Schedar", hint: "Even" },
  { id: "Achird", hint: "Friendly" },
  { id: "Zubenelgenubi", hint: "Casual" },
  { id: "Sadachbia", hint: "Lively" },
  { id: "Sadaltager", hint: "Knowledgeable" },
];

interface GeminiPart {
  inlineData?: { mimeType?: string; data?: string };
}
interface GeminiChunk {
  candidates?: Array<{ content?: { parts?: GeminiPart[] }; finishReason?: string }>;
  error?: { message?: string };
}

function requestBody(text: string, voiceId: string): string {
  return JSON.stringify({
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceId } } },
    },
  });
}

function headers(): Record<string, string> {
  return { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY! };
}

/** `audio/l16; rate=24000; channels=1` → 24000 */
function rateOf(mime: string | undefined): number {
  const m = /rate=(\d+)/.exec(mime ?? "");
  return m ? Number(m[1]) : DEFAULT_RATE;
}

async function failure(res: Response): Promise<TtsError> {
  const text = await res.text().catch(() => "");
  return new TtsError("tts_unavailable", `Gemini hata (${res.status}): ${text.slice(0, 200)}`);
}

/** Tam klip: tek istek, WAV → mp3 */
async function generate(text: string, voiceId: string, modelId: string): Promise<SynthesizeResult> {
  const res = await fetch(`${API}/${encodeURIComponent(modelId)}:generateContent`, {
    method: "POST",
    headers: headers(),
    body: requestBody(text, voiceId),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  }).catch((err: Error) => {
    throw new TtsError("tts_unavailable", `Gemini ulaşılamadı: ${err.message}`);
  });
  if (!res.ok) throw await failure(res);
  const data = (await res.json()) as GeminiChunk;
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData?.data) {
    const reason = data.candidates?.[0]?.finishReason ?? data.error?.message ?? "ses yok";
    throw new TtsError("tts_unavailable", `Gemini ses döndürmedi (${reason})`);
  }
  const { pcm, sampleRate } = wavToPcm(Buffer.from(part.inlineData.data, "base64"), rateOf(part.inlineData.mimeType));
  return { audioBase64: pcmToMp3(pcm, sampleRate).toString("base64"), alignment: null };
}

/**
 * Akış: SSE (`streamGenerateContent?alt=sse`) — her olay bir PCM parçası taşır; mp3'e
 * çevrilip anında verilir. `signal` iptali Gemini isteğini de keser (üretim ücreti durur).
 */
async function* generateStream(text: string, voiceId: string, modelId: string, signal: AbortSignal): AsyncGenerator<Buffer> {
  const res = await fetch(`${API}/${encodeURIComponent(modelId)}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: headers(),
    body: requestBody(text, voiceId),
    signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
  }).catch((err: Error) => {
    throw new TtsError("tts_unavailable", `Gemini ulaşılamadı: ${err.message}`);
  });
  if (!res.ok || !res.body) throw await failure(res);

  let encoder: ReturnType<typeof createMp3Stream> | null = null;
  let produced = false;
  const decoder = new TextDecoder();
  let pending = "";
  for await (const bytes of res.body as unknown as AsyncIterable<Uint8Array>) {
    pending += decoder.decode(bytes, { stream: true });
    let nl: number;
    while ((nl = pending.indexOf("\n")) >= 0) {
      const line = pending.slice(0, nl).trim();
      pending = pending.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      let chunk: GeminiChunk;
      try {
        chunk = JSON.parse(line.slice(5)) as GeminiChunk;
      } catch {
        continue; // bozuk/yarım olay — sonraki satır gelir
      }
      if (chunk.error) throw new TtsError("tts_unavailable", `Gemini akış hatası: ${chunk.error.message ?? ""}`.slice(0, 220));
      for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
        const b64 = part.inlineData?.data;
        if (!b64) continue;
        encoder ??= createMp3Stream(rateOf(part.inlineData?.mimeType));
        const mp3 = encoder.push(Buffer.from(b64, "base64"));
        if (mp3.length) {
          produced = true;
          yield mp3;
        }
      }
    }
  }
  if (!encoder) throw new TtsError("tts_unavailable", "Gemini akışı ses döndürmedi");
  const tail = encoder.end();
  if (tail.length) yield tail;
  else if (!produced) throw new TtsError("tts_unavailable", "Gemini akışı boş");
}

export const geminiProvider: TtsProvider = {
  name: "gemini",
  models: GEMINI_MODELS,
  voices: GEMINI_VOICES,
  timestamps: false,
  configured: () => Boolean(env.GEMINI_API_KEY),
  defaultVoiceId: () => env.GEMINI_TTS_VOICE ?? DEFAULT_VOICE,
  // Dili model metinden kendisi algılar (dil alanı yok) — kod yalnız "kapsamda" işaretidir
  languageCode: (normalized) => normalized,

  /** Tek dilli metin (panel önizlemesi) */
  synthesize({ text, voiceId, modelId }) {
    return generate(text, voiceId, modelId);
  },

  /** TAM CÜMLE: bir speak çağrısının bütün parçaları tek metin, tek istek */
  synthesizeRuns({ runs, voiceId, modelId }: SynthesizeRunsRequest) {
    return generate(joinForSpeech(runs.map((r) => r.text)), voiceId, modelId);
  },

  stream({ runs, voiceId, modelId }: SynthesizeRunsRequest, signal: AbortSignal) {
    return generateStream(joinForSpeech(runs.map((r) => r.text)), voiceId, modelId, signal);
  },
};

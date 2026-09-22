import type {
  AdminTtsPreviewBody,
  AdminTtsPreviewResponse,
  AdminTtsSettingsResponse,
  TtsProvider as TtsProviderName,
  TtsSettings,
} from "@glotmate/contracts";
import { normalizeNativeLanguage } from "../../lib/language.js";
import { elevenlabsProvider } from "./elevenlabs.js";
import { inworldProvider } from "./inworld.js";
import { getTtsSettings, invalidateTtsSettingsCache, saveTtsSettings } from "./settings.js";
import { TtsError, type SynthesizeResult, type TtsProvider } from "./types.js";

export { TtsError } from "./types.js";
export type { CharAlignment, SynthesizeResult, TtsProvider } from "./types.js";
export { getTtsSettings } from "./settings.js";

/**
 * TTS GATEWAY — `modules/llm/index.ts` ile aynı rol: sağlayıcı seçimi tek
 * yerde, çağıranlar (`session/service.ts` → `tts()`) sağlayıcı adı bilmez.
 *
 * Aktif sağlayıcı `app_settings.tts`'ten gelir (admin panel). Seçili sağlayıcının
 * anahtarı veya sesi yoksa OTOMATİK GEÇİŞ YAPILMAZ: `tts_unavailable` fırlatılır,
 * istemci metni ekranda bırakır (bugünkü davranış). Sebep: sesin kimliği ve
 * maliyet sessizce kaymasın; operatör paneli görüp elle geçer.
 */
export const PROVIDERS: Record<TtsProviderName, TtsProvider> = {
  elevenlabs: elevenlabsProvider,
  inworld: inworldProvider,
};

export interface ActiveTts {
  provider: TtsProvider;
  voiceId: string;
  modelId: string;
}

/** Ayarlardan aktif sağlayıcı + çözümlenmiş ses/model; eksikse `tts_unavailable`. */
export async function resolveActiveTts(): Promise<ActiveTts> {
  const { settings } = await getTtsSettings();
  return resolveFromSettings(settings);
}

function resolveFromSettings(settings: TtsSettings): ActiveTts {
  const provider = PROVIDERS[settings.provider];
  const cfg = settings[settings.provider];
  const voiceId = cfg.voiceId ?? provider.defaultVoiceId();
  if (!provider.configured()) {
    throw new TtsError("tts_unavailable", `TTS yapılandırılmamış: ${provider.name} anahtarı yok`);
  }
  if (!voiceId) {
    throw new TtsError("tts_unavailable", `TTS yapılandırılmamış: ${provider.name} ses kimliği yok`);
  }
  return { provider, voiceId, modelId: cfg.modelId };
}

/**
 * SES ÖNBELLEĞİ (süreç içi, LRU'suz basit): anahtar (sağlayıcı, ses, model, dil,
 * metin) — sağlayıcı değişince eski klipler çakışmaz. İngilizce çekirdek
 * klipleri TÜM dillerin öğrencilerinde birebir aynı — en büyük kazanç orada.
 * R2'ye taşıma CLAUDE.md'de planlı; bu, onun öncülü.
 */
const audioCache = new Map<string, SynthesizeResult>();
const AUDIO_CACHE_MAX = 500;

export function audioCacheKey(active: ActiveTts, languageCode: string, text: string): string {
  return `${active.provider.name}|${active.voiceId}|${active.modelId}|${languageCode}|${text}`;
}

export async function synthesizeClip(active: ActiveTts, text: string, languageCode: string): Promise<SynthesizeResult> {
  const key = audioCacheKey(active, languageCode, text);
  const cached = audioCache.get(key);
  if (cached) return cached;

  const clip = await active.provider.synthesize({
    text,
    languageCode,
    voiceId: active.voiceId,
    modelId: active.modelId,
  });

  if (audioCache.size >= AUDIO_CACHE_MAX) {
    const first = audioCache.keys().next().value;
    if (first) audioCache.delete(first);
  }
  audioCache.set(key, clip);
  return clip;
}

// ---------------------------------------------------------------------------
// Admin: ayar okuma/yazma/önizleme — `modules/admin/routes.ts` çağırır
// ---------------------------------------------------------------------------

export async function buildTtsSettingsResponse(): Promise<AdminTtsSettingsResponse> {
  const { settings, updatedAt } = await getTtsSettings();
  return {
    settings,
    configured: { elevenlabs: elevenlabsProvider.configured(), inworld: inworldProvider.configured() },
    defaultVoiceId: { elevenlabs: elevenlabsProvider.defaultVoiceId(), inworld: inworldProvider.defaultVoiceId() },
    models: { elevenlabs: [...elevenlabsProvider.models], inworld: [...inworldProvider.models] },
    updatedAt,
  };
}

/**
 * Kaydetmeden önce seçili sağlayıcı çözümlenir: anahtarı veya sesi yoksa
 * `provider_not_configured` — panel bunu 400 olarak görür, yazma olmaz.
 */
export async function updateTtsSettings(settings: TtsSettings, updatedBy: string | null): Promise<AdminTtsSettingsResponse> {
  try {
    resolveFromSettings(settings);
  } catch (err) {
    if (err instanceof TtsError) throw new TtsError("provider_not_configured", err.message);
    throw err;
  }
  if (!PROVIDERS[settings.provider].models.includes(settings[settings.provider].modelId)) {
    throw new TtsError("provider_not_configured", `${settings.provider} için bilinmeyen model: ${settings[settings.provider].modelId}`);
  }
  await saveTtsSettings(settings, updatedBy);
  invalidateTtsSettingsCache();
  return buildTtsSettingsResponse();
}

/** Önbelleği ATLAR — operatör gerçek gecikmeyi ve sesi duyar. */
export async function previewTts(body: AdminTtsPreviewBody): Promise<AdminTtsPreviewResponse> {
  const provider = PROVIDERS[body.provider];
  if (!provider.configured()) {
    throw new TtsError("provider_not_configured", `${provider.name} anahtarı .env'de yok`);
  }
  const languageCode = provider.languageCode(normalizeNativeLanguage(body.language));
  if (!languageCode) {
    throw new TtsError("provider_not_configured", `${provider.name} "${body.language}" dilini desteklemiyor`);
  }
  const startedAt = Date.now();
  const clip = await provider.synthesize({
    text: body.text,
    languageCode,
    voiceId: body.voiceId,
    modelId: body.modelId,
  });
  return { audioBase64: clip.audioBase64, latencyMs: Date.now() - startedAt, hasAlignment: clip.alignment !== null };
}

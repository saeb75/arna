import type {
  AdminTtsPreviewBody,
  AdminTtsPreviewResponse,
  AdminTtsSettingsResponse,
  TtsCapabilities,
  TtsProvider as TtsProviderName,
  TtsSettings,
} from "@glotmate/contracts";
import { normalizeNativeLanguage } from "../../lib/language.js";
import { azureProvider } from "./azure.js";
import { elevenlabsProvider } from "./elevenlabs.js";
import { inworldProvider } from "./inworld.js";
import { getTtsSettings, invalidateTtsSettingsCache, saveTtsSettings } from "./settings.js";
import { TtsError, type SynthesizeResult, type TtsProvider, type TtsRun } from "./types.js";

export { TtsError } from "./types.js";
export type { CharAlignment, SynthesizeResult, TtsProvider, TtsRun } from "./types.js";
export { getTtsSettings } from "./settings.js";

/**
 * TTS GATEWAY — `modules/llm/index.ts` ile aynı rol: sağlayıcı seçimi tek
 * yerde, çağıranlar (`session/service.ts` → `tts()`) sağlayıcı adı bilmez.
 *
 * Aktif sağlayıcı `app_settings.tts`'ten gelir (admin panel). Seçili sağlayıcının
 * anahtarı veya sesi yoksa OTOMATİK GEÇİŞ YAPILMAZ: `tts_unavailable` fırlatılır,
 * istemci metni ekranda bırakır (bugünkü davranış). Sebep: sesin kimliği ve
 * maliyet sessizce kaymasın; operatör paneli görüp elle geçer.
 *
 * İKİ ÜRETİM YOLU: sağlayıcı `synthesizeRuns` taşıyorsa (Azure) bir speak
 * çağrısının tüm parçaları TEK klip; taşımıyorsa parçalar dil başına gruplanıp
 * klip klip üretilir (ElevenLabs/Inworld). İstemci iki durumda da klip listesi alır.
 */
export const PROVIDERS: Record<TtsProviderName, TtsProvider> = {
  elevenlabs: elevenlabsProvider,
  inworld: inworldProvider,
  azure: azureProvider,
};
const PROVIDER_NAMES = Object.keys(PROVIDERS) as TtsProviderName[];

export interface ActiveTts {
  provider: TtsProvider;
  voiceId: string;
  modelId: string;
}

export function capabilitiesOf(provider: TtsProvider): TtsCapabilities {
  return { multiLanguageClip: typeof provider.synthesizeRuns === "function" };
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
 * Normalize ana dil → sağlayıcı kodu, sesin KAPSAMIYLA süzülmüş: türetilen kod
 * listede yoksa aynı dilli başka locale (`sw-TZ` → `sw-KE`), o da yoksa `null`
 * (parça sessiz). Kapsam bilinmiyorsa (`coverage` yok/ağ hatası) iyimser geçer.
 */
export async function resolveLanguage(active: ActiveTts, normalized: string): Promise<string | null> {
  const code = active.provider.languageCode(normalized);
  if (!code) return null;
  if (!active.provider.coverage) return code;
  const cov = await active.provider.coverage(active.voiceId);
  if (!cov) return code;
  for (const c of cov) if (c.toLowerCase() === code.toLowerCase()) return c;
  const lang = code.split("-")[0]!.toLowerCase();
  for (const c of cov) if (c.split("-")[0]!.toLowerCase() === lang) return c;
  return null;
}

/**
 * SES ÖNBELLEĞİ (süreç içi, LRU'suz basit): anahtar (sağlayıcı, ses, model, dil,
 * metin) — sağlayıcı değişince eski klipler çakışmaz. İngilizce çekirdek
 * klipleri TÜM dillerin öğrencilerinde birebir aynı — en büyük kazanç orada.
 * Çok parçalı klipte anahtar parçaların JSON'u. R2'ye taşıma CLAUDE.md'de planlı.
 */
const audioCache = new Map<string, SynthesizeResult>();
const AUDIO_CACHE_MAX = 500;

export function audioCacheKey(active: ActiveTts, languageCode: string, text: string): string {
  return `${active.provider.name}|${active.voiceId}|${active.modelId}|${languageCode}|${text}`;
}

export function runsCacheKey(active: ActiveTts, runs: TtsRun[]): string {
  return `${active.provider.name}|${active.voiceId}|${active.modelId}|multi|${JSON.stringify(runs)}`;
}

function remember(key: string, clip: SynthesizeResult): SynthesizeResult {
  if (audioCache.size >= AUDIO_CACHE_MAX) {
    const first = audioCache.keys().next().value;
    if (first) audioCache.delete(first);
  }
  audioCache.set(key, clip);
  return clip;
}

export async function synthesizeClip(active: ActiveTts, text: string, languageCode: string): Promise<SynthesizeResult> {
  const key = audioCacheKey(active, languageCode, text);
  const cached = audioCache.get(key);
  if (cached) return cached;
  const clip = await active.provider.synthesize({ text, languageCode, voiceId: active.voiceId, modelId: active.modelId });
  return remember(key, clip);
}

/** Tek klipte tüm parçalar — yalnız `synthesizeRuns` taşıyan sağlayıcı için */
export async function synthesizeRunsClip(active: ActiveTts, runs: TtsRun[]): Promise<SynthesizeResult> {
  if (!active.provider.synthesizeRuns) throw new TtsError("tts_unavailable", `${active.provider.name} çok parçalı klip üretemez`);
  const key = runsCacheKey(active, runs);
  const cached = audioCache.get(key);
  if (cached) return cached;
  const clip = await active.provider.synthesizeRuns({ runs, voiceId: active.voiceId, modelId: active.modelId });
  return remember(key, clip);
}

/**
 * Dil kodu çözülmüş parçalardan klipler: çok dilli sağlayıcıda TEK klip, diğerlerinde
 * ardışık aynı-dil parçalar birleşip klip klip. `maxCharsPerClip` yalnız ikinci yolda
 * (eski 600 karakter kesimi); tek klip yolunda route tavanı (4000) yeter.
 */
export async function synthesizeRunsToClips(
  active: ActiveTts,
  runs: TtsRun[],
  maxCharsPerClip = 600,
): Promise<Array<SynthesizeResult & { lang: string }>> {
  if (runs.length === 0) return [];
  if (active.provider.synthesizeRuns) {
    const clip = await synthesizeRunsClip(active, runs);
    return [{ ...clip, lang: "multi" }];
  }
  const groups: TtsRun[] = [];
  for (const r of runs) {
    const prev = groups[groups.length - 1];
    if (prev && prev.languageCode === r.languageCode) prev.text += ` ${r.text}`;
    else groups.push({ ...r });
  }
  const clips: Array<SynthesizeResult & { lang: string }> = [];
  for (const g of groups) {
    const clip = await synthesizeClip(active, g.text.slice(0, maxCharsPerClip), g.languageCode);
    clips.push({ ...clip, lang: g.languageCode });
  }
  return clips;
}

// ---------------------------------------------------------------------------
// Admin: ayar okuma/yazma/önizleme — `modules/admin/routes.ts` çağırır
// ---------------------------------------------------------------------------

function perProvider<T>(f: (p: TtsProvider) => T): Record<TtsProviderName, T> {
  return Object.fromEntries(PROVIDER_NAMES.map((n) => [n, f(PROVIDERS[n])])) as Record<TtsProviderName, T>;
}

export async function buildTtsSettingsResponse(): Promise<AdminTtsSettingsResponse> {
  const { settings, updatedAt } = await getTtsSettings();
  return {
    settings,
    configured: perProvider((p) => p.configured()),
    defaultVoiceId: perProvider((p) => p.defaultVoiceId()),
    models: perProvider((p) => [...p.models]),
    capabilities: perProvider(capabilitiesOf),
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

/**
 * Önbelleği ATLAR — operatör gerçek gecikmeyi ve sesi duyar. Ders ucuyla aynı
 * yolu izler (`runs` → klipler): çok dilli tek klip yeteneği burada kıyaslanır.
 */
export async function previewTts(body: AdminTtsPreviewBody): Promise<AdminTtsPreviewResponse> {
  const provider = PROVIDERS[body.provider];
  if (!provider.configured()) {
    throw new TtsError("provider_not_configured", `${provider.name} anahtarı .env'de yok`);
  }
  const active: ActiveTts = { provider, voiceId: body.voiceId, modelId: body.modelId };
  const wanted = body.runs ?? [{ language: body.language, text: body.text }];

  const runs: TtsRun[] = [];
  for (const r of wanted) {
    const code = await resolveLanguage(active, normalizeNativeLanguage(r.language));
    if (!code) throw new TtsError("provider_not_configured", `${provider.name} "${r.language}" dilini bu sesle konuşamıyor`);
    runs.push({ languageCode: code, text: r.text });
  }

  const startedAt = Date.now();
  let clips: SynthesizeResult[];
  if (provider.synthesizeRuns) {
    clips = [await provider.synthesizeRuns({ runs, voiceId: body.voiceId, modelId: body.modelId })];
  } else {
    clips = [];
    for (const r of runs) clips.push(await provider.synthesize({ ...r, voiceId: body.voiceId, modelId: body.modelId }));
  }
  return {
    clips: clips.map((c) => ({ audioBase64: c.audioBase64, hasAlignment: c.alignment !== null })),
    latencyMs: Date.now() - startedAt,
  };
}

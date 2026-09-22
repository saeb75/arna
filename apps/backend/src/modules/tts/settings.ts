import { ttsSettingsSchema, type TtsSettings } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { appSettings } from "../../db/schema.js";
import { AZURE_MODELS } from "./azure.js";
import { ELEVENLABS_MODELS } from "./elevenlabs.js";
import { INWORLD_MODELS } from "./inworld.js";

/**
 * `app_settings.tts` — aktif sağlayıcı + ses/model. Satır yoksa env
 * varsayılanı servis edilir (ElevenLabs, bugünkü davranış); bozuk satır da
 * varsayılana düşer ve uyarı basar — TTS hiçbir durumda ayar yüzünden kilitlenmez.
 *
 * Satır okunurken varsayılanla BİRLEŞTİRİLİR: yeni sağlayıcı eklendiğinde eski
 * kayıtta o anahtar yoktur; birleştirme olmasa şema düşer ve operatörün seçimi
 * sessizce ElevenLabs'e dönerdi.
 *
 * Süreç içi önbellek: her klip için DB'ye gitmemek. TTL kısa (15 sn) çünkü
 * çok süreçli dağıtımda bir örneğin PUT'u diğerinde ancak TTL'de görünür;
 * tek süreçte `save` anında geçersiz kılar.
 */
const KEY = "tts";
const TTL_MS = 15_000;

export interface StoredTtsSettings {
  settings: TtsSettings;
  updatedAt: string | null;
}

let cache: { value: StoredTtsSettings; at: number } | null = null;

export function defaultTtsSettings(): TtsSettings {
  return {
    provider: "elevenlabs",
    elevenlabs: { voiceId: null, modelId: ELEVENLABS_MODELS[0] },
    inworld: { voiceId: null, modelId: INWORLD_MODELS[0] },
    azure: { voiceId: null, modelId: AZURE_MODELS[0] },
  };
}

/** Saklanan (muhtemelen eksik anahtarlı) değer + varsayılan → tam ayar; şemadan geçmezse null */
export function mergeStoredSettings(stored: unknown): TtsSettings | null {
  const base = defaultTtsSettings();
  const merged = typeof stored === "object" && stored !== null ? { ...base, ...(stored as Record<string, unknown>) } : base;
  const parsed = ttsSettingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : null;
}

export function invalidateTtsSettingsCache(): void {
  cache = null;
}

export async function getTtsSettings(): Promise<StoredTtsSettings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, KEY)).limit(1);
  let value: StoredTtsSettings;
  if (!row) {
    value = { settings: defaultTtsSettings(), updatedAt: null };
  } else {
    const merged = mergeStoredSettings(row.value);
    if (merged) {
      value = { settings: merged, updatedAt: row.updatedAt.toISOString() };
    } else {
      console.warn(`[tts] app_settings.${KEY} şemaya uymuyor, env varsayılanı kullanılıyor`);
      value = { settings: defaultTtsSettings(), updatedAt: row.updatedAt.toISOString() };
    }
  }
  cache = { value, at: Date.now() };
  return value;
}

export async function saveTtsSettings(settings: TtsSettings, updatedBy: string | null): Promise<StoredTtsSettings> {
  const clean = ttsSettingsSchema.parse(settings); // yazmadan önce de şemadan geçer
  const [row] = await db
    .insert(appSettings)
    .values({ key: KEY, value: clean, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: clean, updatedBy, updatedAt: new Date() },
    })
    .returning({ updatedAt: appSettings.updatedAt });
  const value = { settings: clean, updatedAt: row!.updatedAt.toISOString() };
  cache = { value, at: Date.now() };
  return value;
}

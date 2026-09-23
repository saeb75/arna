import { avatarSettingsSchema, type AvatarSettings } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { appSettings } from "../../db/schema.js";

/**
 * `app_settings.avatar` — aktif avatar kimliği (tts/settings.ts deseninin aynası).
 * Satır yoksa varsayılan Fat Man (bugünkü davranış); bozuk satır da varsayılana
 * düşer ve uyarı basar — sahne hiçbir durumda ayar yüzünden boş kalmaz.
 * 15 sn süreç içi önbellek; `save` tek süreçte anında geçersiz kılar.
 */
const KEY = "avatar";
const TTL_MS = 15_000;

export interface StoredAvatarSettings {
  settings: AvatarSettings;
  updatedAt: string | null;
}

let cache: { value: StoredAvatarSettings; at: number } | null = null;

export function defaultAvatarSettings(): AvatarSettings {
  return { activeId: "fatman" };
}

export function invalidateAvatarSettingsCache(): void {
  cache = null;
}

export async function getAvatarSettings(): Promise<StoredAvatarSettings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, KEY)).limit(1);
  let value: StoredAvatarSettings;
  if (!row) {
    value = { settings: defaultAvatarSettings(), updatedAt: null };
  } else {
    const parsed = avatarSettingsSchema.safeParse(row.value);
    if (parsed.success) {
      value = { settings: parsed.data, updatedAt: row.updatedAt.toISOString() };
    } else {
      // Kayıtta artık listede olmayan bir id kalmış olabilir (avatar emekli edildi)
      console.warn(`[avatar] app_settings.${KEY} şemaya uymuyor, varsayılan (fatman) kullanılıyor`);
      value = { settings: defaultAvatarSettings(), updatedAt: row.updatedAt.toISOString() };
    }
  }
  cache = { value, at: Date.now() };
  return value;
}

export async function saveAvatarSettings(
  settings: AvatarSettings,
  updatedBy: string | null,
): Promise<StoredAvatarSettings> {
  const clean = avatarSettingsSchema.parse(settings);
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

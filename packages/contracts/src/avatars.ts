// Avatar kaydı — admin'den seçilen aktif avatar (TTS sağlayıcı deseninin aynası).
//
// Kayıt KODDA yaşar: her avatar apps/web tarafında bir sahne profili (3D: kemik/
// morph eşlemeleri; 2.5D: sprite katmanları) gerektirdiğinden, listeye satır
// eklemek kod değişikliğidir; admin yalnız AKTİF olanı seçer. Seçilen avatarın
// SİSTEMİ (3D / 2.5D) embed sayfasının hangi çiziciyi kuracağını belirler —
// köprü protokolü (avatarProtocol.ts) ikisinde de aynıdır, mobil sistemi bilmez.
// Varlıklar şimdilik apps/web/public/avatars/ altında (R2/CDN taşıması ayrı faz).
// avatarProtocol.ts tip-only'dir ve öyle kalır — runtime sabitleri bu dosyada.
import { z } from "zod";

export const AVATAR_IDS = ["fatman", "emma", "meadow", "raven", "raven3d", "kai", "lena"] as const;
export const avatarIdSchema = z.enum(AVATAR_IDS);
export type AvatarId = z.infer<typeof avatarIdSchema>;

/** Çizim sistemi: "3d" = GLB + three.js sahnesi, "2.5d" = katmanlı sprite portre */
export const AVATAR_SYSTEMS = ["3d", "2.5d"] as const;
export const avatarSystemSchema = z.enum(AVATAR_SYSTEMS);
export type AvatarSystem = z.infer<typeof avatarSystemSchema>;

export const AVATAR_SYSTEM_OF: Record<AvatarId, AvatarSystem> = {
  fatman: "3d",
  emma: "3d",
  meadow: "3d",
  raven: "2.5d",
  raven3d: "3d",
  kai: "2.5d",
  lena: "2.5d",
};

/** Ayar satırı yoksa / bozuksa ve istemci ayarı henüz almadıysa kullanılan avatar */
export const DEFAULT_AVATAR_ID: AvatarId = "raven";

/** Admin arayüzü İngilizce (kural) — etiketler operatöre görünür */
export const AVATAR_LABELS: Record<AvatarId, string> = {
  fatman: "Fat Man",
  emma: "Emma",
  meadow: "Meadow (bust)",
  raven: "Raven (2.5D)",
  raven3d: "Raven (3D)",
  kai: "Kai (2.5D)",
  lena: "Lena (2.5D)",
};

export const AVATAR_SYSTEM_LABELS: Record<AvatarSystem, string> = {
  "3d": "3D model",
  "2.5d": "2.5D sprite",
};

/** app_settings.avatar satırının değeri */
export const avatarSettingsSchema = z.object({
  activeId: avatarIdSchema,
});
export type AvatarSettings = z.infer<typeof avatarSettingsSchema>;

export const adminAvatarSettingsResponseSchema = z.object({
  settings: avatarSettingsSchema,
  /** Seçilebilir avatarlar — kod kaydından türetilir */
  avatars: z.array(z.object({ id: avatarIdSchema, label: z.string().min(1), system: avatarSystemSchema })),
  /** Satır hiç yazılmadıysa null — admin "using default" gösterir */
  updatedAt: z.string().nullable(),
});
export type AdminAvatarSettingsResponse = z.infer<typeof adminAvatarSettingsResponseSchema>;

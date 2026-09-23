// Avatar kaydı — admin'den seçilen aktif avatar (TTS sağlayıcı deseninin aynası).
//
// Kayıt KODDA yaşar: her avatar apps/web tarafında bir sahne profili (kemik/
// morph eşlemeleri) gerektirdiğinden, listeye satır eklemek kod değişikliğidir;
// admin yalnız AKTİF olanı seçer. GLB'ler şimdilik apps/web/public/avatars/
// altında (R2/CDN taşıması ayrı faz). avatarProtocol.ts tip-only'dir ve öyle
// kalır — runtime sabitleri bu dosyada.
import { z } from "zod";

export const AVATAR_IDS = ["fatman", "emma"] as const;
export const avatarIdSchema = z.enum(AVATAR_IDS);
export type AvatarId = z.infer<typeof avatarIdSchema>;

/** Admin arayüzü İngilizce (kural) — etiketler operatöre görünür */
export const AVATAR_LABELS: Record<AvatarId, string> = {
  fatman: "Fat Man",
  emma: "Emma",
};

/** app_settings.avatar satırının değeri */
export const avatarSettingsSchema = z.object({
  activeId: avatarIdSchema,
});
export type AvatarSettings = z.infer<typeof avatarSettingsSchema>;

export const adminAvatarSettingsResponseSchema = z.object({
  settings: avatarSettingsSchema,
  /** Seçilebilir avatarlar — kod kaydından türetilir */
  avatars: z.array(z.object({ id: avatarIdSchema, label: z.string().min(1) })),
  /** Satır hiç yazılmadıysa null — admin "using default" gösterir */
  updatedAt: z.string().nullable(),
});
export type AdminAvatarSettingsResponse = z.infer<typeof adminAvatarSettingsResponseSchema>;

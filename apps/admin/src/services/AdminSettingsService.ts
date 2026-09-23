import {
  adminAvatarSettingsResponseSchema,
  adminTtsPreviewResponseSchema,
  adminTtsSettingsResponseSchema,
  type AdminTtsPreviewBody,
  type AdminTtsPreviewResponse,
  type AdminAvatarSettingsResponse,
  type AdminTtsSettingsResponse,
  type AvatarSettings,
  type TtsSettings,
} from "@glotmate/contracts";
import { api } from "@/api";

/**
 * `/v1/admin/settings/tts` — tutor sesi ayarları. Cevaplar contracts
 * şemasından geçmeden dönmez (elle tip yazmak yasak). API anahtarları bu
 * uçlardan hiç gelmez; panel yalnız "anahtar var/yok" bayrağını görür.
 */
export class AdminSettingsService {
  static async fetchTts(): Promise<AdminTtsSettingsResponse> {
    const res = await api.get("/v1/admin/settings/tts");
    return adminTtsSettingsResponseSchema.parse(res.data);
  }

  static async saveTts(settings: TtsSettings): Promise<AdminTtsSettingsResponse> {
    const res = await api.put("/v1/admin/settings/tts", settings);
    return adminTtsSettingsResponseSchema.parse(res.data);
  }

  static async previewTts(body: AdminTtsPreviewBody): Promise<AdminTtsPreviewResponse> {
    const res = await api.post("/v1/admin/settings/tts/preview", body);
    return adminTtsPreviewResponseSchema.parse(res.data);
  }

  static async fetchAvatar(): Promise<AdminAvatarSettingsResponse> {
    const res = await api.get("/v1/admin/settings/avatar");
    return adminAvatarSettingsResponseSchema.parse(res.data);
  }

  static async saveAvatar(settings: AvatarSettings): Promise<AdminAvatarSettingsResponse> {
    const res = await api.put("/v1/admin/settings/avatar", settings);
    return adminAvatarSettingsResponseSchema.parse(res.data);
  }
}

import {
  adminTutorsResponseSchema,
  type AdminTutorBody,
  type AdminTutorCreateBody,
  type AdminTutorsResponse,
} from "@glotmate/contracts";
import { api, InvalidResponseError } from "@/api";

/**
 * `/v1/admin/tutors` — öğretmen kaydı (ad + 2.5D rig + ses). Mutasyon uçlarının TAMAMI
 * listenin kendisini (`AdminTutorsResponse`) döner: varsayılan bayrağı bir satırda
 * değişince diğer satır da değiştiği için liste bütün olarak tazelenir.
 * Ses seçenekleri ve önizleme `AdminSettingsService` (TTS) uçlarından gelir.
 */
export class AdminTutorsService {
  static async fetchList(): Promise<AdminTutorsResponse> {
    const res = await api.get("/v1/admin/tutors");
    return adminTutorsResponseSchema.parse(res.data);
  }

  static async create(body: AdminTutorCreateBody): Promise<AdminTutorsResponse> {
    const res = await api.post("/v1/admin/tutors", body);
    return adminTutorsResponseSchema.parse(res.data);
  }

  static async update(id: string, body: AdminTutorBody): Promise<AdminTutorsResponse> {
    const res = await api.put(`/v1/admin/tutors/${encodeURIComponent(id)}`, body);
    return adminTutorsResponseSchema.parse(res.data);
  }

  /**
   * Kullanıcının ses örneğinde duyacağı İngilizce cümle (sunucu kurar — panel kopyalamaz).
   * Bu uç için contracts'ta şema yok; tek alanlı cevap yerinde denetlenir.
   */
  static async fetchSampleLine(name: string): Promise<string> {
    const res = await api.get("/v1/admin/tutors/sample-line", { params: { name } });
    const text = (res.data as { text?: unknown } | null)?.text;
    if (typeof text !== "string" || !text.trim()) throw new InvalidResponseError("sample-line: missing text");
    return text;
  }
}

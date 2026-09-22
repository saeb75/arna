import {
  adminSessionDetailSchema,
  adminSessionsResponseSchema,
  type AdminSessionDetail,
  type AdminSessionsQuery,
  type AdminSessionsResponse,
} from "@glotmate/contracts";
import { api } from "@/api";

/** `/v1/admin/sessions*` — salt okunur; cevaplar contracts şemasından geçmeden dönmez. */
export class AdminSessionsService {
  /** Süzme/sıralama/sayfalama sunucuda — sorgu contracts şemasıyla aynı şekil */
  static async fetchPage(query: AdminSessionsQuery): Promise<AdminSessionsResponse> {
    // Boolean süzgeçler yalnız AÇIKKEN gider; kapalıyken parametre hiç yazılmaz
    const { onlyErrors, onlyChat, ...rest } = query;
    const res = await api.get("/v1/admin/sessions", {
      params: { ...rest, ...(onlyErrors ? { onlyErrors: "true" } : {}), ...(onlyChat ? { onlyChat: "true" } : {}) },
    });
    return adminSessionsResponseSchema.parse(res.data);
  }

  static async fetchDetail(id: string): Promise<AdminSessionDetail> {
    const res = await api.get(`/v1/admin/sessions/${id}`);
    return adminSessionDetailSchema.parse(res.data);
  }
}

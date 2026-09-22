import {
  adminSessionDetailSchema,
  adminSessionsResponseSchema,
  type AdminSessionDetail,
  type AdminSessionsResponse,
} from "@glotmate/contracts";
import { api } from "@/api";

/** `/v1/admin/sessions*` — salt okunur; cevaplar contracts şemasından geçmeden dönmez. */
export class AdminSessionsService {
  static async fetchList(limit: number): Promise<AdminSessionsResponse> {
    const res = await api.get("/v1/admin/sessions", { params: { limit } });
    return adminSessionsResponseSchema.parse(res.data);
  }

  static async fetchDetail(id: string): Promise<AdminSessionDetail> {
    const res = await api.get(`/v1/admin/sessions/${id}`);
    return adminSessionDetailSchema.parse(res.data);
  }
}

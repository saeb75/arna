import {
  adminUserDetailSchema,
  adminUserMemoriesPageSchema,
  adminUserSessionsPageSchema,
  adminUsersResponseSchema,
  type AdminPageQuery,
  type AdminProGrantBody,
  type AdminUserDetail,
  type AdminUserMemoriesPage,
  type AdminUserSessionsPage,
  type AdminUsersResponse,
} from "@glotmate/contracts";
import { api } from "@/api";

/**
 * `/v1/admin/users*` — liste, detay, sunucu-sayfalı oturum/hafıza alt listeleri ve
 * TEK yazma ucu: ücretsiz Pro tanıma/geri alma (mağaza aboneliğine dokunmaz).
 * Cevaplar contracts şemasından geçmeden dönmez.
 */
export class AdminUsersService {
  static async fetchList(): Promise<AdminUsersResponse> {
    const res = await api.get("/v1/admin/users");
    return adminUsersResponseSchema.parse(res.data);
  }

  static async fetchDetail(id: string): Promise<AdminUserDetail> {
    const res = await api.get(`/v1/admin/users/${id}`);
    return adminUserDetailSchema.parse(res.data);
  }

  static async fetchSessions(id: string, query: AdminPageQuery): Promise<AdminUserSessionsPage> {
    const res = await api.get(`/v1/admin/users/${id}/sessions`, { params: query });
    return adminUserSessionsPageSchema.parse(res.data);
  }

  static async fetchMemories(id: string, query: AdminPageQuery): Promise<AdminUserMemoriesPage> {
    const res = await api.get(`/v1/admin/users/${id}/memories`, { params: query });
    return adminUserMemoriesPageSchema.parse(res.data);
  }

  /** `grant: true, until: null` = süresiz; `grant: false` admin tanımasını kaldırır. Güncel detay döner. */
  static async setPro(id: string, body: AdminProGrantBody): Promise<AdminUserDetail> {
    const res = await api.post(`/v1/admin/users/${id}/pro`, body);
    return adminUserDetailSchema.parse(res.data);
  }
}

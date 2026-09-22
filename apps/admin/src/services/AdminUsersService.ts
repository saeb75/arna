import {
  adminUserDetailSchema,
  adminUsersResponseSchema,
  type AdminUserDetail,
  type AdminUsersResponse,
} from "@glotmate/contracts";
import { api } from "@/api";

/** `/v1/admin/users*` — salt okunur; cevaplar contracts şemasından geçmeden dönmez. */
export class AdminUsersService {
  static async fetchList(): Promise<AdminUsersResponse> {
    const res = await api.get("/v1/admin/users");
    return adminUsersResponseSchema.parse(res.data);
  }

  static async fetchDetail(id: string): Promise<AdminUserDetail> {
    const res = await api.get(`/v1/admin/users/${id}`);
    return adminUserDetailSchema.parse(res.data);
  }
}

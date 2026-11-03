import { adminOverviewSchema, type AdminOverview } from "@glotmate/contracts";
import { api } from "@/api";

/** `/v1/admin/overview` — kullanıcı/aktiflik/Pro/oturum sayaçları + `llm_calls` maliyet panosu. */
export type OverviewDays = 7 | 30 | 90;

export class AdminOverviewService {
  static async fetch(days: OverviewDays): Promise<AdminOverview> {
    const res = await api.get("/v1/admin/overview", { params: { days } });
    return adminOverviewSchema.parse(res.data);
  }
}

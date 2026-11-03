import {
  adminRoleplayAttemptsPageSchema,
  adminRoleplayDetailSchema,
  adminRoleplayLintSchema,
  adminRoleplaysResponseSchema,
  type AdminPageQuery,
  type AdminRoleplayAttemptsPage,
  type AdminRoleplayDetail,
  type AdminRoleplayLint,
  type AdminRoleplaysResponse,
  type RoleplaySpec,
} from "@glotmate/contracts";
import { api } from "@/api";

/**
 * `/v1/admin/roleplays*` — senaryo listesi, detay ve revizyon aksiyonları.
 * Mutasyonların TAMAMI `AdminRoleplayDetail` döner (sunucu sözleşmesi); cevaplar
 * contracts şemasından geçmeden ekrana ulaşmaz. Kapı (`lintRoleplay`) kayıtta da
 * koşar: 422 `lint_failed` gövdesinde `report` taşır — controller onu çıkarır.
 */
export class AdminRoleplaysService {
  static async fetchList(): Promise<AdminRoleplaysResponse> {
    const res = await api.get("/v1/admin/roleplays");
    return adminRoleplaysResponseSchema.parse(res.data);
  }

  static async fetchDetail(id: string): Promise<AdminRoleplayDetail> {
    const res = await api.get(`/v1/admin/roleplays/${encodeURIComponent(id)}`);
    return adminRoleplayDetailSchema.parse(res.data);
  }

  /** Kuru koşu — yazmaz; şema hatası 400 `invalid_input` + `issues` olarak fırlar */
  static async lint(spec: RoleplaySpec): Promise<AdminRoleplayLint> {
    const res = await api.post("/v1/admin/roleplays/lint", { spec });
    return adminRoleplayLintSchema.parse((res.data as { report?: unknown }).report);
  }

  /** Yeni senaryo → revizyon 1 taslak (201). Slug kalıcıdır; 409 `exists` */
  static async create(id: string, spec: RoleplaySpec): Promise<AdminRoleplayDetail> {
    const res = await api.post("/v1/admin/roleplays", { id, spec });
    return adminRoleplayDetailSchema.parse(res.data);
  }

  /** Açık taslağı günceller ya da yeni taslak revizyonu doğurur */
  static async saveDraft(id: string, spec: RoleplaySpec): Promise<AdminRoleplayDetail> {
    const res = await api.put(`/v1/admin/roleplays/${encodeURIComponent(id)}/draft`, { spec });
    return adminRoleplayDetailSchema.parse(res.data);
  }

  static async discardDraft(id: string): Promise<AdminRoleplayDetail> {
    const res = await api.delete(`/v1/admin/roleplays/${encodeURIComponent(id)}/draft`);
    return adminRoleplayDetailSchema.parse(res.data);
  }

  /** Önceki yayın `retired` olur (silinmez — oturumlar revizyona pinli) */
  static async publishDraft(id: string): Promise<AdminRoleplayDetail> {
    const res = await api.post(`/v1/admin/roleplays/${encodeURIComponent(id)}/draft/publish`);
    return adminRoleplayDetailSchema.parse(res.data);
  }

  static async duplicateRevision(id: string, revisionId: string): Promise<AdminRoleplayDetail> {
    const res = await api.post(`/v1/admin/roleplays/${encodeURIComponent(id)}/revisions/${revisionId}/duplicate`);
    return adminRoleplayDetailSchema.parse(res.data);
  }

  static async setStatus(id: string, status: "active" | "retired"): Promise<AdminRoleplayDetail> {
    const res = await api.post(`/v1/admin/roleplays/${encodeURIComponent(id)}/status`, { status });
    return adminRoleplayDetailSchema.parse(res.data);
  }

  static async fetchAttempts(id: string, query: AdminPageQuery): Promise<AdminRoleplayAttemptsPage> {
    const res = await api.get(`/v1/admin/roleplays/${encodeURIComponent(id)}/attempts`, { params: query });
    return adminRoleplayAttemptsPageSchema.parse(res.data);
  }
}

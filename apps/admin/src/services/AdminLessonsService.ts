import {
  adminCoreLintResponseSchema,
  adminLessonDetailSchema,
  adminLessonsResponseSchema,
  type AdminCoreLintResponse,
  type AdminLessonDetail,
  type AdminLessonsResponse,
  type LessonCore,
} from "@glotmate/contracts";
import { api } from "@/api";

/**
 * `/v1/admin/lessons*` — ders matrisi, detay ve katman aksiyonları. Her cevap
 * contracts şemasından geçmeden dönmez: şemaya uymayan veri EKRANA ULAŞMAZ.
 * Mutasyonların tamamı detail döner (sunucu sözleşmesi).
 *
 * LLM tetikleyen çağrılar senkron ve uzun (10–60 sn, iki denemede daha fazla) —
 * axios varsayılanı sınırsız ama açıkça yazılı ki niyet görünür olsun.
 */
const LLM_TIMEOUT_MS = 240_000;

export class AdminLessonsService {
  static async fetchMatrix(): Promise<AdminLessonsResponse> {
    const res = await api.get("/v1/admin/lessons");
    return adminLessonsResponseSchema.parse(res.data);
  }

  static async fetchDetail(id: string): Promise<AdminLessonDetail> {
    const res = await api.get(`/v1/admin/lessons/${id}`);
    return adminLessonDetailSchema.parse(res.data);
  }

  static async regenerateCore(id: string): Promise<AdminLessonDetail> {
    const res = await api.post(`/v1/admin/lessons/${id}/core/regenerate`, undefined, { timeout: LLM_TIMEOUT_MS });
    return adminLessonDetailSchema.parse(res.data);
  }

  static async regenerateScenes(id: string): Promise<AdminLessonDetail> {
    const res = await api.post(`/v1/admin/lessons/${id}/scenes/regenerate`, undefined, { timeout: LLM_TIMEOUT_MS });
    return adminLessonDetailSchema.parse(res.data);
  }

  /** Kuru koşu — sunucu lint'i; yazmaz. Lint hatası 422 olarak fırlar (`errorCode` → `lint_failed`). */
  static async lintCore(id: string, core: LessonCore): Promise<AdminCoreLintResponse> {
    const res = await api.post(`/v1/admin/lessons/${id}/core/lint`, { core });
    return adminCoreLintResponseSchema.parse(res.data);
  }

  static async saveCore(id: string, core: LessonCore): Promise<AdminLessonDetail> {
    const res = await api.put(`/v1/admin/lessons/${id}/core`, { core });
    return adminLessonDetailSchema.parse(res.data);
  }

  static async generateLocale(id: string, language: string, force: boolean): Promise<AdminLessonDetail> {
    const res = await api.post(`/v1/admin/lessons/${id}/locales/${encodeURIComponent(language)}`, undefined, {
      params: force ? { force: "1" } : undefined,
      timeout: LLM_TIMEOUT_MS,
    });
    return adminLessonDetailSchema.parse(res.data);
  }

  static async publish(id: string): Promise<AdminLessonDetail> {
    const res = await api.post(`/v1/admin/lessons/${id}/publish`);
    return adminLessonDetailSchema.parse(res.data);
  }
}

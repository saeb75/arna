import { adminLessonsResponseSchema, type AdminLessonsResponse } from "@glotmate/contracts";
import { api } from "@/api";

/**
 * `GET /v1/admin/lessons` — ders matrisi. Cevap contracts şemasından geçmeden
 * dönmez: şemaya uymayan veri EKRANA ULAŞMAZ (elle tip yazmak yasak).
 */
export class AdminLessonsService {
  static async fetchMatrix(): Promise<AdminLessonsResponse> {
    const res = await api.get("/v1/admin/lessons");
    return adminLessonsResponseSchema.parse(res.data);
  }
}

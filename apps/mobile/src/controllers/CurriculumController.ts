import { curriculumResponseSchema } from "@glotmate/contracts";
import { api, errorCode } from "../api";
import { useCurriculumStore } from "../stores/useCurriculumStore";

/**
 * İLK GERÇEK DİLİM — CLAUDE.md desenin kanıtı:
 * Screen → Controller → axios → validate(@glotmate/contracts) → store → Screen.
 * Şema ELLE YAZILMADI; web'in kullandığı curriculumResponseSchema'nın aynısı.
 */
export class CurriculumController {
  /** GET /v1/curriculum/current — doğrular, store'a yazar. */
  static async getCurriculum(): Promise<void> {
    const store = useCurriculumStore.getState();
    store.setLoading(true);
    try {
      const res = await api.get("/v1/curriculum/current");
      // Şemadan geçmeyen veri EKRANA ULAŞMAZ — sözleşme tek yerde yaşar.
      store.setCurriculum(curriculumResponseSchema.parse(res.data));
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }
}

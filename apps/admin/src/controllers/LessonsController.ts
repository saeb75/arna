import { errorCode } from "@/api";
import { AdminLessonsService } from "@/services/AdminLessonsService";
import { useLessonsStore } from "@/stores/useLessonsStore";

/**
 * Ders matrisi: Screen → LessonsController → AdminLessonsService → useLessonsStore.
 * Mobil `CurriculumController.getCurriculum` şablonu: setLoading → try service →
 * store.set → catch setError(errorCode) → finally setLoading(false).
 */
export class LessonsController {
  static async load(): Promise<void> {
    const store = useLessonsStore.getState();
    store.setLoading(true);
    try {
      store.setData(await AdminLessonsService.fetchMatrix());
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }
}

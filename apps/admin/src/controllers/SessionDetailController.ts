import { errorCode } from "@/api";
import { AdminSessionsService } from "@/services/AdminSessionsService";
import { useSessionDetailStore } from "@/stores/useSessionDetailStore";

/** Oturum detayı: Screen → SessionDetailController → AdminSessionsService → useSessionDetailStore. */
export class SessionDetailController {
  static async load(id: string): Promise<void> {
    const store = useSessionDetailStore.getState();
    if (store.detail?.session.id !== id) store.clear();
    store.setLoading(true);
    try {
      store.setDetail(await AdminSessionsService.fetchDetail(id));
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }
}

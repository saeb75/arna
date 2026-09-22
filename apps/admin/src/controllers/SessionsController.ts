import { errorCode } from "@/api";
import { AdminSessionsService } from "@/services/AdminSessionsService";
import { SESSION_LIMITS, useSessionsStore } from "@/stores/useSessionsStore";

/** Oturum listesi: Screen → SessionsController → AdminSessionsService → useSessionsStore. */
export class SessionsController {
  static async load(): Promise<void> {
    const store = useSessionsStore.getState();
    store.setLoading(true);
    try {
      store.setData(await AdminSessionsService.fetchList(store.limit));
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }

  /** Limit değişince liste yeniden çekilir — sunucu en yeni N'i döner */
  static async setLimit(limit: (typeof SESSION_LIMITS)[number]): Promise<void> {
    useSessionsStore.getState().setLimit(limit);
    await this.load();
  }
}

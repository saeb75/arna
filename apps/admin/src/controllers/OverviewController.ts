import { errorCode } from "@/api";
import { AdminOverviewService, type OverviewDays } from "@/services/AdminOverviewService";
import { useOverviewStore } from "@/stores/useOverviewStore";

let requestSeq = 0;

/**
 * Overview: Screen → OverviewController → AdminOverviewService → useOverviewStore.
 * Aralık sekmesi hızlı değiştirilebilir; geç gelen eski cevap yenisini ezmesin diye
 * istek sıra numarası taşır (SessionsController deseni).
 */
export class OverviewController {
  static async load(): Promise<void> {
    const store = useOverviewStore.getState();
    const seq = ++requestSeq;
    store.setLoading(true);
    try {
      const data = await AdminOverviewService.fetch(store.days);
      if (seq !== requestSeq) return; // bayat cevap
      store.setData(data);
    } catch (err) {
      if (seq === requestSeq) store.setError(errorCode(err));
    } finally {
      if (seq === requestSeq) store.setLoading(false);
    }
  }

  /** Aralık değişimi tablo sayfalarını 1'e alır ve yeniden çeker */
  static setDays(days: OverviewDays): void {
    if (useOverviewStore.getState().days === days) return;
    useOverviewStore.getState().setDays(days);
    void this.load();
  }
}

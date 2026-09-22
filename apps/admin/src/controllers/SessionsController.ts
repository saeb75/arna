import type { AdminSessionsQuery } from "@glotmate/contracts";
import { errorCode } from "@/api";
import { AdminSessionsService } from "@/services/AdminSessionsService";
import { useSessionsStore } from "@/stores/useSessionsStore";

/** Arama yazılırken her tuşta istek atılmasın; 300 ms sessizlikten sonra tek istek */
const SEARCH_DEBOUNCE_MS = 300;
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let requestSeq = 0;

/**
 * Oturum listesi: Screen → SessionsController → AdminSessionsService → useSessionsStore.
 * Sorgu değişimi = yeniden çekim. Geç gelen eski cevap yenisini ezmesin diye
 * istek sıra numarası taşır (arama yazarken çok yaşanır).
 */
export class SessionsController {
  static async load(): Promise<void> {
    const store = useSessionsStore.getState();
    const seq = ++requestSeq;
    store.setLoading(true);
    try {
      const data = await AdminSessionsService.fetchPage(store.query);
      if (seq !== requestSeq) return; // bayat cevap
      store.setData(data);
    } catch (err) {
      if (seq === requestSeq) store.setError(errorCode(err));
    } finally {
      if (seq === requestSeq) store.setLoading(false);
    }
  }

  /** Süzgeç/sıralama/ebat değişimi sayfayı 1'e alır ve yeniden çeker */
  static setQuery(patch: Partial<Omit<AdminSessionsQuery, "page" | "q">>): void {
    useSessionsStore.getState().setQuery({ ...patch, page: 1 });
    void this.load();
  }

  static setPage(page: number): void {
    useSessionsStore.getState().setQuery({ page });
    void this.load();
  }

  static setSearch(q: string): void {
    useSessionsStore.getState().setQuery({ q, page: 1 }); // input anında yansısın
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => void this.load(), SEARCH_DEBOUNCE_MS);
  }
}

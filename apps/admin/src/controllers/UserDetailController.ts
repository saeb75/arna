import { toast } from "sonner";
import { errorCode } from "@/api";
import { UsersController } from "@/controllers/UsersController";
import { errorLabel, formatDate } from "@/lib/labels";
import { nextPageState, type PageState } from "@/lib/paginate";
import { AdminUsersService } from "@/services/AdminUsersService";
import { useUserDetailStore } from "@/stores/useUserDetailStore";

let sessionsSeq = 0;
let memoriesSeq = 0;

/**
 * Kullanıcı detayı: Screen → UserDetailController → AdminUsersService → useUserDetailStore.
 * Oturumlar ve hafıza ayrı, sunucu sayfalı uçlardan; her biri kendi sıra numarasıyla
 * (hızlı sayfa değişiminde bayat cevap elenir). Tek yazma: Pro tanıma/geri alma.
 */
export class UserDetailController {
  static async load(id: string): Promise<void> {
    const store = useUserDetailStore.getState();
    if (store.detail?.user.id !== id) store.clear();
    store.setLoading(true);
    void this.loadSessions(id);
    void this.loadMemories(id);
    try {
      useUserDetailStore.getState().setDetail(await AdminUsersService.fetchDetail(id));
    } catch (err) {
      useUserDetailStore.getState().setError(errorCode(err));
    } finally {
      useUserDetailStore.getState().setLoading(false);
    }
  }

  static async loadSessions(id: string): Promise<void> {
    const seq = ++sessionsSeq;
    const { sessions, setSessions } = useUserDetailStore.getState();
    setSessions({ loading: true });
    try {
      const data = await AdminUsersService.fetchSessions(id, sessions.query);
      if (seq === sessionsSeq) useUserDetailStore.getState().setSessions({ data, error: null });
    } catch (err) {
      if (seq === sessionsSeq) useUserDetailStore.getState().setSessions({ error: errorCode(err) });
    } finally {
      if (seq === sessionsSeq) useUserDetailStore.getState().setSessions({ loading: false });
    }
  }

  static async loadMemories(id: string): Promise<void> {
    const seq = ++memoriesSeq;
    const { memories, setMemories } = useUserDetailStore.getState();
    setMemories({ loading: true });
    try {
      const data = await AdminUsersService.fetchMemories(id, memories.query);
      if (seq === memoriesSeq) useUserDetailStore.getState().setMemories({ data, error: null });
    } catch (err) {
      if (seq === memoriesSeq) useUserDetailStore.getState().setMemories({ error: errorCode(err) });
    } finally {
      if (seq === memoriesSeq) useUserDetailStore.getState().setMemories({ loading: false });
    }
  }

  /** Sayfa/ebat değişimi → yeniden çek (ebat değişimi sayfayı 1'e alır) */
  static setSessionsQuery(id: string, patch: Partial<PageState>): void {
    const { sessions, setSessions } = useUserDetailStore.getState();
    setSessions({ query: nextPageState(sessions.query, patch) });
    void this.loadSessions(id);
  }

  static setMemoriesQuery(id: string, patch: Partial<PageState>): void {
    const { memories, setMemories } = useUserDetailStore.getState();
    setMemories({ query: nextPageState(memories.query, patch) });
    void this.loadMemories(id);
  }

  /**
   * Ücretsiz Pro tanıma — `until` ISO ya da null (süresiz). Mağaza aboneliğine dokunmaz.
   * Detay güncel hâliyle döner; liste de tazelenir (Pro sütunu yalan söylemesin).
   */
  static async grantPro(id: string, until: string | null): Promise<void> {
    await this.setPro(id, { grant: true, until }, until ? `Pro granted until ${formatDate(until)}.` : "Pro granted with no expiry.");
  }

  static async revokePro(id: string): Promise<void> {
    await this.setPro(id, { grant: false, until: null }, "Admin Pro revoked — store subscriptions are untouched.");
  }

  private static async setPro(id: string, body: { grant: boolean; until: string | null }, okMessage: string): Promise<void> {
    const store = useUserDetailStore.getState();
    if (store.proBusy) return;
    store.setProBusy(true);
    try {
      useUserDetailStore.getState().setDetail(await AdminUsersService.setPro(id, body));
      toast.success(okMessage);
      void UsersController.load();
    } catch (err) {
      toast.error(errorLabel(errorCode(err)));
    } finally {
      useUserDetailStore.getState().setProBusy(false);
    }
  }
}

import type { AdminUserDetail, AdminUserMemoriesPage, AdminUserSessionsPage } from "@glotmate/contracts";
import { create } from "zustand";
import { FIRST_PAGE, nextPageState, type PageState } from "@/lib/paginate";

/** Sunucu sayfalı alt liste: veri + sorgu + kendi loading/error'u (tablo sayfa değişiminde yerinde kalır) */
export interface ServerList<T> {
  data: T | null;
  query: PageState;
  loading: boolean;
  error: string | null;
}

/** İstemci sayfalı küçük tablolar (detay yükünde tam gelir) */
export type UserDetailTable = "progress" | "checkpoints" | "cost";

const freshList = <T,>(): ServerList<T> => ({ data: null, query: FIRST_PAGE, loading: false, error: null });

/**
 * Kullanıcı detayı. Yalnız UserDetailController yazar (küçük tablo sayfaları ekrandan).
 * Oturumlar ve hafıza BÜYÜYEN listeler → sunucu sayfalı (`/sessions`, `/memories`);
 * detay cevabındaki "son 20/30" kesitleri artık gösterilmez.
 */
interface UserDetailState {
  detail: AdminUserDetail | null;
  loading: boolean;
  error: string | null;
  /** Pro tanıma/geri alma sürüyor */
  proBusy: boolean;
  sessions: ServerList<AdminUserSessionsPage>;
  memories: ServerList<AdminUserMemoriesPage>;
  paging: Record<UserDetailTable, PageState>;
  setDetail: (d: AdminUserDetail) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setProBusy: (v: boolean) => void;
  setSessions: (patch: Partial<ServerList<AdminUserSessionsPage>>) => void;
  setMemories: (patch: Partial<ServerList<AdminUserMemoriesPage>>) => void;
  setPaging: (table: UserDetailTable, patch: Partial<PageState>) => void;
  clear: () => void;
}

export const useUserDetailStore = create<UserDetailState>((set) => ({
  detail: null,
  loading: false,
  error: null,
  proBusy: false,
  sessions: freshList(),
  memories: freshList(),
  paging: { progress: FIRST_PAGE, checkpoints: FIRST_PAGE, cost: FIRST_PAGE },
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setProBusy: (proBusy) => set({ proBusy }),
  setSessions: (patch) => set((s) => ({ sessions: { ...s.sessions, ...patch } })),
  setMemories: (patch) => set((s) => ({ memories: { ...s.memories, ...patch } })),
  setPaging: (table, patch) => set((s) => ({ paging: { ...s.paging, [table]: nextPageState(s.paging[table], patch) } })),
  clear: () =>
    set({
      detail: null,
      error: null,
      proBusy: false,
      sessions: freshList(),
      memories: freshList(),
      paging: { progress: FIRST_PAGE, checkpoints: FIRST_PAGE, cost: FIRST_PAGE },
    }),
}));

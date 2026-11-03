import type { AdminRoleplayAttemptsPage, AdminRoleplayDetail } from "@glotmate/contracts";
import { create } from "zustand";
import { FIRST_PAGE, nextPageState, type PageState } from "@/lib/paginate";

/** Hangi aksiyon sürüyor — buton spinner'ları ve çift tıklama kilidi */
export type RoleplayBusy = "publish" | "discard" | "status" | "duplicate";

export type RoleplayTab = "editor" | "preview" | "revisions" | "attempts" | "stats";

/** İstemci sayfalı küçük tablolar */
export type RoleplayTable = "revisions" | "stats";

/**
 * Senaryo detayı + sekme + alt listeler. Yalnız RoleplayDetailController yazar
 * (sekme/küçük tablo sayfaları ekrandan — sunum durumu). Denemeler BÜYÜYEN liste:
 * sunucu sayfalı, ayrı loading/error ile — sayfa değişiminde tablo yerinde kalır.
 * Editör taslağı ayrı store'da (`useRoleplayEditorStore`) — /roleplays/new de kullanır.
 */
interface RoleplayDetailState {
  detail: AdminRoleplayDetail | null;
  loading: boolean;
  error: string | null;
  busy: RoleplayBusy | null;
  tab: RoleplayTab;
  paging: Record<RoleplayTable, PageState>;
  attempts: AdminRoleplayAttemptsPage | null;
  attemptsQuery: PageState;
  attemptsLoading: boolean;
  attemptsError: string | null;
  setDetail: (d: AdminRoleplayDetail) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setBusy: (b: RoleplayBusy | null) => void;
  setTab: (t: RoleplayTab) => void;
  setPaging: (table: RoleplayTable, patch: Partial<PageState>) => void;
  setAttempts: (a: AdminRoleplayAttemptsPage) => void;
  setAttemptsQuery: (patch: Partial<PageState>) => void;
  setAttemptsLoading: (v: boolean) => void;
  setAttemptsError: (e: string | null) => void;
  clear: () => void;
}

export const useRoleplayDetailStore = create<RoleplayDetailState>((set) => ({
  detail: null,
  loading: false,
  error: null,
  busy: null,
  tab: "editor",
  paging: { revisions: FIRST_PAGE, stats: FIRST_PAGE },
  attempts: null,
  attemptsQuery: FIRST_PAGE,
  attemptsLoading: false,
  attemptsError: null,
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setBusy: (busy) => set({ busy }),
  setTab: (tab) => set({ tab }),
  setPaging: (table, patch) => set((s) => ({ paging: { ...s.paging, [table]: nextPageState(s.paging[table], patch) } })),
  setAttempts: (attempts) => set({ attempts, attemptsError: null }),
  setAttemptsQuery: (patch) => set((s) => ({ attemptsQuery: nextPageState(s.attemptsQuery, patch) })),
  setAttemptsLoading: (attemptsLoading) => set({ attemptsLoading }),
  setAttemptsError: (attemptsError) => set({ attemptsError }),
  clear: () =>
    set({
      detail: null,
      error: null,
      busy: null,
      tab: "editor",
      paging: { revisions: FIRST_PAGE, stats: FIRST_PAGE },
      attempts: null,
      attemptsQuery: FIRST_PAGE,
      attemptsError: null,
    }),
}));

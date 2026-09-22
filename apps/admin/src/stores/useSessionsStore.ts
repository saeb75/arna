import type { AdminSessionsQuery, AdminSessionsResponse } from "@glotmate/contracts";
import { create } from "zustand";

export type SessionSort = AdminSessionsQuery["sort"];
export type SessionFilters = Pick<AdminSessionsQuery, "q" | "kind" | "status" | "level" | "onlyErrors" | "onlyChat">;

/**
 * Oturum listesi — SUNUCU TARAFI sayfalı. Sorgu (süzgeç/sıralama/sayfa/ebat) store'da
 * durur, her değişimde SessionsController yeniden çeker. Yalnız controller yazar.
 * Veri eldeyken tablo yerinde kalır (skeleton yalnız ilk yüklemede).
 */
interface SessionsState {
  data: AdminSessionsResponse | null;
  loading: boolean;
  error: string | null;
  query: AdminSessionsQuery;
  setData: (d: AdminSessionsResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setQuery: (p: Partial<AdminSessionsQuery>) => void;
}

export const DEFAULT_SESSIONS_QUERY: AdminSessionsQuery = {
  page: 1,
  pageSize: 25,
  sort: "newest",
  q: "",
  kind: "all",
  status: "all",
  level: "all",
  onlyErrors: false,
  onlyChat: false,
};

export const useSessionsStore = create<SessionsState>((set) => ({
  data: null,
  loading: false,
  error: null,
  query: DEFAULT_SESSIONS_QUERY,
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setQuery: (p) => set((s) => ({ query: { ...s.query, ...p } })),
}));

import type { AdminSessionsResponse, CefrLevel } from "@glotmate/contracts";
import { create } from "zustand";

export type SessionSort = "newest" | "oldest" | "longest" | "costliest" | "slowest";

export interface SessionFilters {
  q: string;
  kind: "all" | "lesson" | "roleplay";
  status: "all" | "open" | "ended";
  level: CefrLevel | "all";
  /** Özetinde en az bir gözlenen hata */
  onlyErrors: boolean;
  /** En az bir LLM yolu (chat) turu — script-only oturumları gizler */
  onlyChat: boolean;
}

export const SESSION_LIMITS = [200, 500, 1000] as const;

/** Oturum listesi. Yalnız SessionsController yazar; filtre/sıralama/limit store'da. */
interface SessionsState {
  data: AdminSessionsResponse | null;
  loading: boolean;
  error: string | null;
  limit: (typeof SESSION_LIMITS)[number];
  filters: SessionFilters;
  sort: SessionSort;
  setData: (d: AdminSessionsResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLimit: (n: (typeof SESSION_LIMITS)[number]) => void;
  setFilters: (p: Partial<SessionFilters>) => void;
  setSort: (s: SessionSort) => void;
}

export const useSessionsStore = create<SessionsState>((set) => ({
  data: null,
  loading: false,
  error: null,
  limit: 200,
  filters: { q: "", kind: "all", status: "all", level: "all", onlyErrors: false, onlyChat: false },
  sort: "newest",
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLimit: (limit) => set({ limit }),
  setFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p } })),
  setSort: (sort) => set({ sort }),
}));

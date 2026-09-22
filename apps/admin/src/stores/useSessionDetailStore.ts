import type { AdminSessionDetail } from "@glotmate/contracts";
import { create } from "zustand";

/** Oturum detayı. Yalnız SessionDetailController yazar. */
interface SessionDetailState {
  detail: AdminSessionDetail | null;
  loading: boolean;
  error: string | null;
  setDetail: (d: AdminSessionDetail) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  clear: () => void;
}

export const useSessionDetailStore = create<SessionDetailState>((set) => ({
  detail: null,
  loading: false,
  error: null,
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clear: () => set({ detail: null, error: null }),
}));

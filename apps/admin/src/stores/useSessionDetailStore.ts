import type { AdminSessionDetail } from "@glotmate/contracts";
import { create } from "zustand";
import { FIRST_PAGE, nextPageState, type PageState } from "@/lib/paginate";

/** Oturum detayı. Yalnız SessionDetailController yazar; LLM çağrıları tablosunun sayfası ekrandan. */
interface SessionDetailState {
  detail: AdminSessionDetail | null;
  loading: boolean;
  error: string | null;
  callsPaging: PageState;
  setDetail: (d: AdminSessionDetail) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setCallsPaging: (patch: Partial<PageState>) => void;
  clear: () => void;
}

export const useSessionDetailStore = create<SessionDetailState>((set) => ({
  detail: null,
  loading: false,
  error: null,
  callsPaging: FIRST_PAGE,
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCallsPaging: (patch) => set((s) => ({ callsPaging: nextPageState(s.callsPaging, patch) })),
  clear: () => set({ detail: null, error: null, callsPaging: FIRST_PAGE }),
}));

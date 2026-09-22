import type { AdminUserDetail } from "@glotmate/contracts";
import { create } from "zustand";

/** Kullanıcı detayı. Yalnız UserDetailController yazar. */
interface UserDetailState {
  detail: AdminUserDetail | null;
  loading: boolean;
  error: string | null;
  setDetail: (d: AdminUserDetail) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  clear: () => void;
}

export const useUserDetailStore = create<UserDetailState>((set) => ({
  detail: null,
  loading: false,
  error: null,
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clear: () => set({ detail: null, error: null }),
}));

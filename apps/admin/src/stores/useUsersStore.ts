import type { AdminUsersResponse, CefrLevel } from "@glotmate/contracts";
import { create } from "zustand";

export interface UserFilters {
  q: string;
  level: CefrLevel | "all";
  onlyAdmins: boolean;
  /** Son 30 günde giriş ya da oturum */
  onlyActive: boolean;
}

/** Kullanıcı listesi. Yalnız UsersController yazar; filtreler store'da (sekme değişiminde korunur). */
interface UsersState {
  data: AdminUsersResponse | null;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  setData: (d: AdminUsersResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setFilters: (p: Partial<UserFilters>) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  data: null,
  loading: false,
  error: null,
  filters: { q: "", level: "all", onlyAdmins: false, onlyActive: false },
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p } })),
}));

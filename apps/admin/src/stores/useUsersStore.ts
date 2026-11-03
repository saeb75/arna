import type { AdminUsersResponse, CefrLevel } from "@glotmate/contracts";
import { create } from "zustand";
import type { PageSize } from "@/lib/paginate";

export interface UserFilters {
  q: string;
  level: CefrLevel | "all";
  /** Abonelik: Pro (mağaza ya da admin tanıması) / ücretsiz */
  plan: "all" | "pro" | "free";
  /** Misafir = Supabase anonim hesap (henüz e-posta/Apple bağlamamış) */
  account: "all" | "registered" | "guest";
  onlyAdmins: boolean;
  /** Son 30 günde giriş ya da oturum */
  onlyActive: boolean;
}

export type UserSort = "active" | "newest" | "cost" | "sessions" | "email";

/** Kullanıcı listesi. Yalnız UsersController yazar; filtreler store'da (sekme değişiminde korunur). */
interface UsersState {
  data: AdminUsersResponse | null;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  sort: UserSort;
  setData: (d: AdminUsersResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  page: number;
  pageSize: PageSize;
  setPage: (p: number) => void;
  setPageSize: (n: PageSize) => void;
  setFilters: (p: Partial<UserFilters>) => void;
  setSort: (s: UserSort) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  data: null,
  loading: false,
  error: null,
  filters: { q: "", level: "all", plan: "all", account: "all", onlyAdmins: false, onlyActive: false },
  sort: "active",
  page: 1,
  pageSize: 25,
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p }, page: 1 })),
  setSort: (sort) => set({ sort, page: 1 }),
}));

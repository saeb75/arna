import type { AdminRoleplaysResponse } from "@glotmate/contracts";
import { create } from "zustand";
import type { PageSize } from "@/lib/paginate";
import { DEFAULT_ROLEPLAY_FILTERS, type RoleplayFilters, type RoleplaySort } from "@/lib/roleplayFilters";

/**
 * Roleplay listesi — sınırlı liste, tek seferde gelir; süzme/sıralama/sayfalama
 * istemcide. Yalnız RoleplaysController veri yazar; filtre/sıra/sayfa ekrandan.
 */
interface RoleplaysState {
  data: AdminRoleplaysResponse | null;
  loading: boolean;
  error: string | null;
  filters: RoleplayFilters;
  sort: RoleplaySort;
  page: number;
  pageSize: PageSize;
  setData: (d: AdminRoleplaysResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setFilters: (p: Partial<RoleplayFilters>) => void;
  setSort: (s: RoleplaySort) => void;
  setPage: (p: number) => void;
  setPageSize: (n: PageSize) => void;
}

export const useRoleplaysStore = create<RoleplaysState>((set) => ({
  data: null,
  loading: false,
  error: null,
  filters: DEFAULT_ROLEPLAY_FILTERS,
  sort: "title",
  page: 1,
  pageSize: 25,
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p }, page: 1 })),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}));

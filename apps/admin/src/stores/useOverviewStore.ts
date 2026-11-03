import type { AdminOverview } from "@glotmate/contracts";
import { create } from "zustand";
import { FIRST_PAGE, nextPageState, type PageState } from "@/lib/paginate";
import type { OverviewDays } from "@/services/AdminOverviewService";

/** Overview'daki kırılım tabloları — her biri kendi sayfa durumunu taşır */
export type OverviewTable = "purpose" | "model" | "topUsers";

/**
 * Overview panosu. Yalnız OverviewController yazar (`days`, veri); tablo sayfa
 * durumları liste ekranlarındaki gibi ekrandan yazılır. Aralık değişince
 * sayfalar 1'e döner (filtre değişimi kuralı); veri eldeyken pano yerinde kalır.
 */
interface OverviewState {
  data: AdminOverview | null;
  loading: boolean;
  error: string | null;
  days: OverviewDays;
  paging: Record<OverviewTable, PageState>;
  setData: (d: AdminOverview) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setDays: (d: OverviewDays) => void;
  setPaging: (table: OverviewTable, patch: Partial<PageState>) => void;
}

const FRESH_PAGING: Record<OverviewTable, PageState> = { purpose: FIRST_PAGE, model: FIRST_PAGE, topUsers: FIRST_PAGE };

export const useOverviewStore = create<OverviewState>((set) => ({
  data: null,
  loading: false,
  error: null,
  days: 30,
  paging: FRESH_PAGING,
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDays: (days) => set({ days, paging: FRESH_PAGING }),
  setPaging: (table, patch) => set((s) => ({ paging: { ...s.paging, [table]: nextPageState(s.paging[table], patch) } })),
}));

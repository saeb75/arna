import type { AdminLessonsResponse, CefrLevel, LessonKind } from "@glotmate/contracts";
import { create } from "zustand";

/** Katman filtresi — operatörün "eksik ne var" sorularına doğrudan karşılık gelir */
export type LayerFilter = "all" | "no_core" | "unpublished" | "no_locale" | "stale";

export interface LessonFilters {
  level: CefrLevel;
  kind: LessonKind | "all";
  layer: LayerFilter;
  q: string;
}

/**
 * Ders matrisi durumu. Yalnız LessonsController yazar; filtreler UI durumu ama
 * store'da durur ki sayfadan çıkıp dönünce seçim korunsun.
 */
interface LessonsState {
  data: AdminLessonsResponse | null;
  loading: boolean;
  error: string | null;
  filters: LessonFilters;
  setData: (d: AdminLessonsResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setFilters: (p: Partial<LessonFilters>) => void;
}

export const useLessonsStore = create<LessonsState>((set) => ({
  data: null,
  loading: false,
  error: null,
  filters: { level: "A1", kind: "all", layer: "all", q: "" },
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (p) => set((s) => ({ filters: { ...s.filters, ...p } })),
}));

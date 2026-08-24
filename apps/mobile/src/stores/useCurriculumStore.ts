import { create } from "zustand";
import type { CurriculumResponse } from "@arna/contracts";

interface CurriculumState {
  curriculum: CurriculumResponse | null;
  loading: boolean;
  error: string | null;
  setCurriculum: (c: CurriculumResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useCurriculumStore = create<CurriculumState>((set) => ({
  curriculum: null,
  loading: false,
  error: null,
  setCurriculum: (curriculum) => set({ curriculum, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

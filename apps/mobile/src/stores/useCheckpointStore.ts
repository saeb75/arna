import { create } from "zustand";
import type { Checkpoint } from "@arna/contracts";

interface CheckpointState {
  checkpoint: Checkpoint | null;
  loading: boolean;
  error: string | null;
  /** Sonuç POST'u düştüyse — testi geçersiz kılmaz, yalnız bilgilendirir */
  saveError: string | null;
  setCheckpoint: (c: Checkpoint) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setSaveError: (e: string | null) => void;
  clear: () => void;
}

export const useCheckpointStore = create<CheckpointState>((set) => ({
  checkpoint: null,
  loading: false,
  error: null,
  saveError: null,
  setCheckpoint: (checkpoint) => set({ checkpoint, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSaveError: (saveError) => set({ saveError }),
  clear: () => set({ checkpoint: null, error: null, saveError: null }),
}));

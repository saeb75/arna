import { create } from "zustand";
import type { Checkpoint } from "@glotmate/contracts";

interface CheckpointState {
  checkpoint: Checkpoint | null;
  loading: boolean;
  error: string | null;
  /** Sonuç POST'u düştüyse — testi geçersiz kılmaz, yalnız bilgilendirir */
  saveError: string | null;
  /** Dinleme maddesinin sesi çalıyor (öğretmenin sesi) */
  speaking: boolean;
  setSpeaking: (v: boolean) => void;
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
  speaking: false,
  setSpeaking: (speaking) => set({ speaking }),
  setCheckpoint: (checkpoint) => set({ checkpoint, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSaveError: (saveError) => set({ saveError }),
  clear: () => set({ checkpoint: null, error: null, saveError: null }),
}));

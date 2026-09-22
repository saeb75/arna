import { create } from "zustand";

export interface WarmTarget {
  lessonId: string;
  language: string;
  /** bayat/başarısız paket → anahtardaki hazır satır silinip yeniden üretilir */
  force: boolean;
}

export interface WarmFailure {
  lessonId: string;
  language: string;
  code: string;
}

/**
 * Toplu dil paketi ısıtması — İSTEMCİDE orkestre edilir (sunucuda kuyruk yok).
 * Yalnız LocaleWarmController yazar. `cancelRequested` bir bayraktır: süren
 * istekler bitirilir, yenisi başlatılmaz.
 */
interface LocaleWarmState {
  running: boolean;
  cancelRequested: boolean;
  level: string | null;
  languages: string[];
  total: number;
  done: number;
  failures: WarmFailure[];
  start: (p: { level: string; languages: string[]; total: number }) => void;
  tick: (failure?: WarmFailure) => void;
  requestCancel: () => void;
  finish: () => void;
  reset: () => void;
}

const initial = {
  running: false,
  cancelRequested: false,
  level: null,
  languages: [] as string[],
  total: 0,
  done: 0,
  failures: [] as WarmFailure[],
};

export const useLocaleWarmStore = create<LocaleWarmState>((set) => ({
  ...initial,
  start: ({ level, languages, total }) => set({ ...initial, running: true, level, languages, total }),
  tick: (failure) =>
    set((s) => ({ done: s.done + 1, failures: failure ? [...s.failures, failure] : s.failures })),
  requestCancel: () => set({ cancelRequested: true }),
  finish: () => set({ running: false }),
  reset: () => set(initial),
}));

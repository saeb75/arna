import { create } from "zustand";
import type { Entitlement, MeResponse, MeStats } from "@glotmate/contracts";

/**
 * Öğrencinin kendi hesabı: profil, abonelik, günlük kota (GET /v1/me) ve
 * istatistikler (GET /v1/me/stats). Store'a yalnız MeController/ProController yazar.
 */
interface MeState {
  me: MeResponse | null;
  stats: MeStats | null;
  loading: boolean;
  error: string | null;
  /** Profil kaydı sürüyor (ayar sheet'leri bekleme göstergesi) */
  saving: boolean;
  set: (p: Partial<Omit<MeState, "set" | "setEntitlement" | "reset">>) => void;
  setEntitlement: (entitlement: Entitlement) => void;
  reset: () => void;
}

export const useMeStore = create<MeState>((set) => ({
  me: null,
  stats: null,
  loading: false,
  error: null,
  saving: false,
  set: (p) => set(p),
  setEntitlement: (entitlement) => set((s) => (s.me ? { me: { ...s.me, entitlement } } : {})),
  reset: () => set({ me: null, stats: null, loading: false, error: null, saving: false }),
}));

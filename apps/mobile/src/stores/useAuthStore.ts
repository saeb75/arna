import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

/**
 * Oturum durumu. Store'a YALNIZ AuthController yazar (CLAUDE.md sözleşmesi) —
 * tek istisna api/index.ts'teki 401 yakalayıcının clear() çağrısı.
 * `ready`: kalıcı oturum AsyncStorage'dan okunana kadar false — açılışta
 * login ekranının bir anlığına parlamasını önler.
 */
interface AuthState {
  session: Session | null;
  ready: boolean;
  error: string | null;
  setSession: (s: Session | null) => void;
  setReady: () => void;
  setError: (e: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  ready: false,
  error: null,
  setSession: (session) => set({ session, error: null }),
  setReady: () => set({ ready: true }),
  setError: (error) => set({ error }),
  clear: () => set({ session: null }),
}));

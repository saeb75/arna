import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { AuthService } from "@/services/AuthService";

/**
 * Oturum durumu. Yalnız AuthController yazar (istisna: `api/index.ts` 401'de `clear`).
 * `ready`: kalıcı oturum localStorage'dan okunana kadar false — AppBootstrap bu
 * sırada hiçbir ekran göstermez ki login sayfası parlamasın.
 */
interface AuthState {
  session: Session | null;
  isAdmin: boolean;
  ready: boolean;
  /** Hata KODU (supabase `error.code` ya da bizim kodumuz); metin `lib/labels.ts`'te */
  error: string | null;
  setSession: (s: Session | null) => void;
  setReady: () => void;
  setError: (e: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAdmin: false,
  ready: false,
  error: null,
  setSession: (session) => set({ session, isAdmin: AuthService.isAdminSession(session), error: null }),
  setReady: () => set({ ready: true }),
  setError: (error) => set({ error }),
  clear: () => set({ session: null, isAdmin: false }),
}));

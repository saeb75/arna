import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

/**
 * Oturum + açılış durumu. Store'a YALNIZ AuthController yazar (CLAUDE.md) —
 * tek istisna api/index.ts'teki 401 yakalayıcısının `clear()` çağrısı.
 *
 * MİSAFİR ÖNCE (12 Eki 2026 kararı): ilk açılışta Supabase anonim oturumu
 * açılır; hesap oluşturmak AYNI kullanıcıyı kalıcı yapar. `isAnonymous` bu
 * yüzden oturumla birlikte tutulur.
 */
interface AuthState {
  session: Session | null;
  isAnonymous: boolean;
  /** Açılış bitti: oturum var ve profil (varsa) yüklendi */
  ready: boolean;
  /** Açılış başarısız (ağ yok, anonim giriş reddedildi) — kök "tekrar dene" gösterir */
  bootError: string | null;
  /** Giriş/bağlama sürüyor */
  busy: boolean;
  /** Son auth hatasının kodu (tr.auth.errors anahtarı) */
  error: string | null;
  /** E-posta bağlandı ama doğrulama bekleniyor */
  pendingEmail: string | null;
  set: (p: Partial<Omit<AuthState, "set" | "setSession" | "clear">>) => void;
  setSession: (s: Session | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAnonymous: false,
  ready: false,
  bootError: null,
  busy: false,
  error: null,
  pendingEmail: null,
  set: (p) => set(p),
  setSession: (session) => set({ session, isAnonymous: session?.user.is_anonymous === true }),
  clear: () => set({ session: null, isAnonymous: false, ready: false }),
}));

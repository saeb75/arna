import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Supabase Auth sarmalayıcısı — HTTP/Supabase'e dokunan tek katman (services).
 * Stateless: veri döner ya da hata kodu fırlatır; store'a DOKUNMAZ, loading tutmaz.
 * Store yazımı AuthController'ın işi.
 */
export class AuthError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

export class AuthService {
  static async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  static async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AuthError(error.code ?? "auth_error");
    if (!data.session) throw new AuthError("no_session");
    return data.session;
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  /** Token yenilenmesi / başka sekmede çıkış gibi değişimleri dinler; abonelik iptali döner. */
  static onAuthStateChange(cb: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
    return () => data.subscription.unsubscribe();
  }

  /**
   * Admin rolü yalnız `app_metadata`dan okunur — Supabase'de bunu sadece servis
   * anahtarı yazabilir; `user_metadata`yı kullanıcı kendi değiştirebilir.
   * Backend `requireAdmin` aynı claim'e bakar; burası yalnız UI kapısı.
   */
  static isAdminSession(session: Session | null): boolean {
    return session?.user.app_metadata?.role === "admin";
  }
}

import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Auth akışı — stateless class, tüm durum useAuthStore'da (CLAUDE.md deseni).
 * Supabase çağrıları da controller'dan geçer; ekran supabase import edemez.
 */
export class AuthController {
  /** Açılışta bir kez: kalıcı oturumu yükle + değişiklikleri dinle. */
  static async restore(): Promise<void> {
    const store = useAuthStore.getState();
    const { data } = await supabase.auth.getSession();
    store.setSession(data.session);
    store.setReady();
    supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session);
    });
  }

  static async signIn(email: string, password: string): Promise<void> {
    const store = useAuthStore.getState();
    store.setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return store.setError(error.message);
    store.setSession(data.session);
  }

  static async signUp(email: string, password: string): Promise<void> {
    const store = useAuthStore.getState();
    store.setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return store.setError(error.message);
    store.setSession(data.session);
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
  }
}

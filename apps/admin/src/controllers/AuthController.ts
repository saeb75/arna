import { AuthError, AuthService } from "@/services/AuthService";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Auth akışı: Screen → AuthController → AuthService → useAuthStore.
 * Stateless class, static metotlar, Promise<void>: değer döndürmez, store'a yazar.
 * Yönlendirme BURADA DEĞİL — rota dosyaları store'a bakıp <Redirect/> render eder.
 */
export class AuthController {
  /** Açılışta bir kez: kalıcı oturumu yükle + değişiklikleri dinle. */
  static async restore(): Promise<void> {
    const store = useAuthStore.getState();
    store.setSession(await AuthService.getSession());
    store.setReady();
    AuthService.onAuthStateChange((session) => useAuthStore.getState().setSession(session));
  }

  static async signIn(email: string, password: string): Promise<void> {
    const store = useAuthStore.getState();
    store.setError(null);
    try {
      store.setSession(await AuthService.signIn(email, password));
    } catch (err) {
      store.setError(err instanceof AuthError ? err.code : "auth_error");
    }
  }

  static async signOut(): Promise<void> {
    await AuthService.signOut();
    useAuthStore.getState().clear();
  }
}

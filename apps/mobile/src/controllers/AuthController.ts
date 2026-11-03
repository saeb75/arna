import type { AuthError, Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { tr } from "../i18n/tr";
import { supabase } from "../lib/supabase";
import { AppleAuthService } from "../services/AppleAuthService";
import { HapticsService } from "../services/HapticsService";
import { useAuthStore } from "../stores/useAuthStore";
import { useCurriculumStore } from "../stores/useCurriculumStore";
import { useMeStore } from "../stores/useMeStore";
import { useOnboardingStore } from "../stores/useOnboardingStore";
import { useRoleplayStore } from "../stores/useRoleplayStore";
import { MeController } from "./MeController";
import { NotificationController } from "./NotificationController";
import { ProController } from "./ProController";
import { ToastController } from "./ToastController";

/**
 * AUTH + AÇILIŞ — stateless class, tüm durum useAuthStore'da.
 *
 * MİSAFİR ÖNCE (12 Eki 2026 kararı): ilk açılışta Supabase ANONİM oturumu
 * açılır; onboarding, paywall ve dersler hesapsız çalışır. "İlerlemeni kaydet"
 * AYNI kullanıcıyı kalıcı yapar (e-posta: `updateUser`, Apple: `linkIdentity`)
 * — kimlik değişmediği için ilerleme ve satın alma (RevenueCat müşteri kimliği
 * = Supabase kimliği) olduğu gibi taşınır. Mevcut hesaba GİRMEK ise kimliği
 * değiştirir: misafir ilerlemesi geride kalır (ekran önce uyarır).
 */

let listening = false;

/** Supabase hata kodu → tr.auth.errors anahtarı */
function codeOf(error: AuthError | Error | null | undefined): string {
  const code = (error as AuthError | undefined)?.code ?? "";
  if (code === "invalid_credentials") return "invalid_credentials";
  if (code === "email_exists" || code === "user_already_exists") return "email_exists";
  if (code === "identity_already_exists") return "identity_already_exists";
  if (code === "weak_password") return "weak_password";
  if (code === "email_address_invalid" || code === "validation_failed") return "invalid_email";
  return "generic";
}

export class AuthController {
  private static store() {
    return useAuthStore.getState();
  }

  /**
   * Açılış zinciri: kalıcı oturum → yoksa anonim giriş → RevenueCat → profil.
   * Bitince `ready` (kapı yönlendirir) ya da `bootError` (kök "tekrar dene").
   */
  static async boot(): Promise<void> {
    this.store().set({ ready: false, bootError: null });
    try {
      const { data } = await supabase.auth.getSession();
      let session: Session | null = data.session;
      if (!session) {
        const res = await supabase.auth.signInAnonymously();
        if (res.error || !res.data.session) throw res.error ?? new Error("no_session");
        session = res.data.session;
      }
      this.store().setSession(session);
      this.listen();
      ProController.init(session.user.id);
      if (!(await MeController.load())) throw new Error(useMeStore.getState().error ?? "me_failed");
      if (useMeStore.getState().me?.profile) {
        void MeController.syncTimezone();
        void NotificationController.resync();
      }
      this.store().set({ ready: true });
    } catch (err) {
      this.store().set({ bootError: (err as Error).message || "boot_failed" });
    } finally {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }

  private static listen(): void {
    if (listening) return;
    listening = true;
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) useAuthStore.getState().setSession(session);
    });
  }

  /** Hesap değişti (giriş, çıkış, silme): kullanıcıya ait her şeyi boşalt, kapıdan yeniden geç */
  private static async restart(session: Session | null): Promise<void> {
    useMeStore.getState().reset();
    useCurriculumStore.setState({ curriculum: null, error: null });
    useRoleplayStore.setState({ list: null, briefs: {}, error: null });
    if (session) {
      this.store().setSession(session);
      await ProController.identify(session.user.id);
      await MeController.load();
      if (useMeStore.getState().me?.profile) useOnboardingStore.getState().reset();
      this.store().set({ ready: true });
    } else {
      await this.boot();
    }
    if (router.canDismiss()) router.dismissAll();
    router.replace("/");
  }

  // --- mevcut hesaba giriş ----------------------------------------------------

  static async signInEmail(email: string, password: string): Promise<void> {
    this.store().set({ busy: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.session) return this.store().set({ error: codeOf(error) });
      HapticsService.success();
      await this.restart(data.session);
      ToastController.success(tr.auth.signedIn);
    } finally {
      this.store().set({ busy: false });
    }
  }

  static async signInApple(): Promise<void> {
    this.store().set({ busy: true, error: null });
    try {
      const apple = await AppleAuthService.signIn();
      if (!apple) return;
      const { data, error } = await supabase.auth.signInWithIdToken({ provider: "apple", token: apple.token });
      if (error || !data.session) return this.store().set({ error: codeOf(error) });
      HapticsService.success();
      await this.restart(data.session);
      ToastController.success(tr.auth.signedIn);
    } catch {
      this.store().set({ error: "generic" });
    } finally {
      this.store().set({ busy: false });
    }
  }

  // --- misafiri kalıcı yapma (AYNI kullanıcı) ----------------------------------

  /**
   * E-posta + şifre bağla. Anonim kullanıcıda ikisi TEK çağrıda gider (Supabase
   * şifreyi ancak e-postayla birlikte kabul eder). "Confirm email" açıksa e-posta
   * doğrulanana kadar `new_email` bekler — ekran "e-postanı kontrol et" der.
   */
  static async linkEmail(email: string, password: string): Promise<void> {
    this.store().set({ busy: true, error: null, pendingEmail: null });
    try {
      const { data, error } = await supabase.auth.updateUser({ email: email.trim(), password });
      if (error) return this.store().set({ error: codeOf(error) });
      if (data.user?.email && !data.user.is_anonymous) {
        await this.afterLink();
      } else {
        this.store().set({ pendingEmail: email.trim() });
      }
    } finally {
      this.store().set({ busy: false });
    }
  }

  /** Apple kimliğini bu misafire bağla (Supabase "Manual linking" açık olmalı) */
  static async linkApple(): Promise<void> {
    this.store().set({ busy: true, error: null });
    try {
      const apple = await AppleAuthService.signIn();
      if (!apple) return;
      const { error } = await supabase.auth.linkIdentity({ provider: "apple", token: apple.token });
      if (error) return this.store().set({ error: codeOf(error) });
      await this.afterLink();
    } catch {
      this.store().set({ error: "generic" });
    } finally {
      this.store().set({ busy: false });
    }
  }

  /** Bağlama bitti: yeni belirteç (is_anonymous=false) + profil tazele, sheet'i kapat */
  private static async afterLink(): Promise<void> {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) this.store().setSession(data.session);
    await MeController.load();
    HapticsService.success();
    if (router.canGoBack()) router.back();
    ToastController.success(tr.auth.linked);
  }

  /** Doğrulama bağlantısına tıklandıktan sonra: oturumu tazele, kalıcı mı bak */
  static async checkVerified(): Promise<void> {
    const { data } = await supabase.auth.refreshSession();
    if (data.session && !data.session.user.is_anonymous) {
      this.store().set({ pendingEmail: null });
      await this.afterLink();
    }
  }

  /**
   * 401 kurtarma (api interceptor'ı çağırır): önce belirteci tazele; olmazsa
   * oturum gerçekten gitmiştir (kullanıcı silindi, belirteç iptal) — yeni
   * misafirle kapıdan geç. Aynı anda gelen 401'ler tek kurtarmaya bağlanır.
   */
  private static recovering: Promise<void> | null = null;

  static recover(): Promise<void> {
    if (this.recovering) return this.recovering;
    this.recovering = (async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) {
        this.store().setSession(data.session);
        return;
      }
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      this.store().clear();
      await this.restart(null);
    })().finally(() => {
      this.recovering = null;
    });
    return this.recovering;
  }

  static clearError(): void {
    this.store().set({ error: null });
  }

  // --- çıkış ve silme ----------------------------------------------------------

  /** Çıkış: kalıcı hesap kapanır; uygulama yeni bir misafirle onboarding'e döner */
  static async signOut(): Promise<void> {
    await supabase.auth.signOut().catch(() => undefined);
    await ProController.forget();
    useOnboardingStore.getState().reset();
    this.store().clear();
    await this.restart(null);
  }

  static async deleteAccount(): Promise<void> {
    this.store().set({ busy: true });
    try {
      if (!(await MeController.deleteAccount())) return;
      // Kullanıcı sunucuda silindi — yerel oturumu kapat (sunucuya çağrı yok)
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      await ProController.forget();
      useOnboardingStore.getState().reset();
      this.store().clear();
      ToastController.info(tr.profile.deleted);
      await this.restart(null);
    } finally {
      this.store().set({ busy: false });
    }
  }
}

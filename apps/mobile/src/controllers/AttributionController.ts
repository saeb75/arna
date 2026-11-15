import { AttributionService } from "../services/AttributionService";
import { PurchasesService } from "../services/PurchasesService";
import { TrackingService } from "../services/TrackingService";
import { useAuthStore } from "../stores/useAuthStore";
import { useMeStore } from "../stores/useMeStore";

/**
 * AppsFlyer'ın hazır olay adları. SATIN ALMA burada loglanmaz: RevenueCat geliri
 * AppsFlyer'a sunucudan sunucuya bildirir, ikisi birden çift sayardı.
 */
const AF_EVENTS = {
  login: "af_login",
  registration: "af_complete_registration",
  tutorialCompletion: "af_tutorial_completion",
  lessonCompleted: "lesson_completed",
  roleplayCompleted: "roleplay_completed",
} as const;

/** Çalışma başına bir kez: izleme sorusu (sürerken aynı söz döner) */
let trackingAsk: Promise<void> | null = null;
/** Dersler ekranı göründükten bir an sonra — soru onboarding'in son karesinin değil uygulamanın üstünde çıksın */
const TRACKING_ASK_DELAY_MS = 800;
let watching = false;

/**
 * KURULUM ÖLÇÜMÜ + İZLEME İZNİ (14 Kas 2026, kullanıcı kararı; GlotCast deseni).
 * AppsFlyer oturum okunduktan sonra başlar (kurulum kullanıcı kimliğini taşır — misafir
 * dahil, kimlik Supabase kimliği), RevenueCat AppsFlyer kimliğini alır. iOS'un izleme
 * sorusu onboarding'den SONRA, sekme kabuğu ilk kez ekrandayken sorulur. Hiçbir akış
 * kararı bu sınıfa bağlı değildir; her çağrı sessizce düşebilir.
 */
export class AttributionController {
  /** Açılışta bir kez (AppRoot) */
  static start(): void {
    if (watching) return;
    watching = true;
    let begun = false;
    const begin = (userId: string | null) => {
      begun = true;
      AttributionService.start(userId);
      void AttributionService.uid().then((uid) => {
        if (uid) void PurchasesService.linkAppsFlyer(uid);
      });
    };
    useAuthStore.subscribe((now, before) => {
      const id = now.session?.user.id ?? null;
      if (!begun) {
        if (now.ready) begin(id);
      } else if (id !== (before.session?.user.id ?? null)) {
        AttributionService.setCustomerUserId(id);
      }
    });
    const auth = useAuthStore.getState();
    if (auth.ready) begin(auth.session?.user.id ?? null);
  }

  /**
   * iOS'un izleme sorusu — profil varken (onboarding bitti) sekme kabuğu ilk göründüğünde.
   * Cevaplandıysa ya da iOS değilse hiçbir şey yapmaz.
   */
  static askTrackingOnce(): Promise<void> {
    if (!useMeStore.getState().me?.profile) return Promise.resolve();
    trackingAsk ??= this.askTracking();
    return trackingAsk;
  }

  private static async askTracking(): Promise<void> {
    if (!(await TrackingService.canAsk())) return;
    await new Promise((resolve) => setTimeout(resolve, TRACKING_ASK_DELAY_MS));
    const granted = await TrackingService.request();
    // İzin varsa RevenueCat reklam kimliğini okur (satın almalar AppsFlyer'da eşleşir)
    if (granted) await PurchasesService.collectDeviceIdentifiers();
  }

  static signedIn(provider: "email" | "apple", fresh: boolean): void {
    void AttributionService.log(fresh ? AF_EVENTS.registration : AF_EVENTS.login, { af_registration_method: provider });
  }

  static onboardingCompleted(): void {
    void AttributionService.log(AF_EVENTS.tutorialCompletion, { af_success: true });
  }

  static lessonCompleted(lessonId: string): void {
    void AttributionService.log(AF_EVENTS.lessonCompleted, { af_content_id: lessonId, af_content_type: "lesson" });
  }

  static roleplayCompleted(slug: string): void {
    void AttributionService.log(AF_EVENTS.roleplayCompleted, { af_content_id: slug, af_content_type: "roleplay" });
  }
}

import { curriculumResponseSchema, type Interest } from "@glotmate/contracts";
import { router } from "expo-router";
import { api } from "../api";
import { DEFAULT_NATIVE_LANGUAGE, deviceTimezone } from "../domain/language";
import { HapticsService } from "../services/HapticsService";
import { useCurriculumStore } from "../stores/useCurriculumStore";
import { useOnboardingStore, type OnboardingStep } from "../stores/useOnboardingStore";
import { MeController } from "./MeController";
import { NotificationController } from "./NotificationController";

type Answers = Parameters<ReturnType<typeof useOnboardingStore.getState>["set"]>[0];

/** Soru adımları — ilerleme çubuğu ve "n/7" bu sırayı sayar */
export const QUESTION_STEPS: OnboardingStep[] = ["name", "track", "level", "tutor", "interests", "occupation", "goal"];
const ORDER: OnboardingStep[] = ["intro", ...QUESTION_STEPS, "building", "plan", "notify"];

/**
 * İLK AÇILIŞ — tanıtım → 7 soru → plan hazırlanıyor (POST /v1/onboarding) →
 * plan → PAYWALL → hatırlatıcı izni → dersler. LLM çağrısı YOK (katalog sabit).
 * Taslak cihazda kalıcı: uygulama kapanırsa kaldığı adımdan döner.
 */
export class OnboardingController {
  private static store() {
    return useOnboardingStore.getState();
  }

  static answer(p: Answers): void {
    this.store().set(p);
  }

  static toggleInterest(key: Interest): void {
    const { interests } = this.store();
    if (interests.includes(key)) this.store().set({ interests: interests.filter((i) => i !== key) });
    else if (interests.length < 8) this.store().set({ interests: [...interests, key] });
  }

  static next(): void {
    const { step } = this.store();
    const i = ORDER.indexOf(step);
    const to = ORDER[i + 1];
    if (to) this.store().set({ step: to, backwards: false });
  }

  static back(): void {
    const { step } = this.store();
    const i = QUESTION_STEPS.indexOf(step);
    if (i > 0) this.store().set({ step: QUESTION_STEPS[i - 1]!, backwards: true });
    else if (i === 0) this.store().set({ step: "intro", backwards: true });
  }

  /**
   * POST /v1/onboarding — profil + seviye. "Plan hazırlanıyor" animasyonu
   * sürerken koşar. Dönüş: başarılı mı (adım "tekrar dene" gösterir).
   */
  static async submit(): Promise<boolean> {
    const o = this.store();
    if (!o.track || !o.level || !o.dailyGoal) return false;
    try {
      const res = await api.post("/v1/onboarding", {
        displayName: o.displayName.trim() || "Learner",
        dailyGoalMinutes: o.dailyGoal,
        track: o.track,
        interests: o.interests.length ? o.interests : ["travel"],
        occupation: o.occupation.trim() || undefined,
        cefrLevel: o.level,
        nativeLanguage: DEFAULT_NATIVE_LANGUAGE,
        tutorLanguage: o.tutorLanguage ?? "native",
        timezone: deviceTimezone(),
      });
      useCurriculumStore.getState().setCurriculum(curriculumResponseSchema.parse(res.data));
      await MeController.load();
      this.store().set({ submitted: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Plan ekranının eylemi: hatırlatıcıya ya da derslere. Eskiden arada paywall bir
   * ADIMDI — 5 Kas 2026'da kota/Pro kalktı (her şey ücretsiz), adım da kalktı.
   */
  static async afterPlan(): Promise<void> {
    if (this.store().reminderTime) this.store().set({ step: "notify", backwards: false });
    else this.finish();
  }

  static async enableReminder(): Promise<void> {
    const time = this.store().reminderTime;
    if (time) await NotificationController.enable(time);
    this.finish();
  }

  static finish(): void {
    HapticsService.success();
    router.replace("/lessons");
    // Taslak sayfa GİTTİKTEN sonra sıfırlanır: önce sıfırlansaydı ayrılan ekran
    // bir kare için tanıtımı (kendi StatusBar'ıyla) yeniden çizip donmuş kalıyordu.
    setTimeout(() => useOnboardingStore.getState().reset(), 600);
  }

  /** "Hesabım var" — mevcut hesaba giriş sheet'i */
  static haveAccount(): void {
    router.push("/auth/login");
  }
}

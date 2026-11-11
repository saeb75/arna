import { curriculumResponseSchema, type Interest } from "@glotmate/contracts";
import { router } from "expo-router";
import { api } from "../api";
import { DEFAULT_NATIVE_LANGUAGE, deviceTimezone } from "../domain/language";
import { HapticsService } from "../services/HapticsService";
import { useCurriculumStore } from "../stores/useCurriculumStore";
import { useOnboardingStore, type OnboardingStep } from "../stores/useOnboardingStore";
import { useTutorsStore } from "../stores/useTutorsStore";
import { MeController } from "./MeController";
import { NotificationController } from "./NotificationController";

type Answers = Parameters<ReturnType<typeof useOnboardingStore.getState>["set"]>[0];

/**
 * Soru adımları — ilerleme çubuğu ve "n/8" bu sırayı sayar. Öğretmen seçimi ("teacher")
 * açıklama dilinden ("tutor") ÖNCE gelir: dil sorusu seçilen öğretmenin adıyla sorulur.
 * Öğretmen kaydı yoksa (GET /v1/tutors boş) adım hiç görünmez — eski davranış.
 */
const ALL_QUESTION_STEPS: OnboardingStep[] = ["name", "track", "level", "teacher", "tutor", "interests", "occupation", "goal"];
const ORDER: OnboardingStep[] = ["intro", ...ALL_QUESTION_STEPS, "building", "plan", "notify"];

/** Görünen soru adımları — `hasTutors`: seçilebilir öğretmen var mı (store'dan) */
export function questionSteps(hasTutors: boolean): OnboardingStep[] {
  return hasTutors ? ALL_QUESTION_STEPS : ALL_QUESTION_STEPS.filter((s) => s !== "teacher");
}

function hasTutors(): boolean {
  return (useTutorsStore.getState().tutors?.length ?? 0) > 0;
}

/**
 * İLK AÇILIŞ — tanıtım → 7–8 soru → plan hazırlanıyor (POST /v1/onboarding) →
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
    // Sıra TAM listeden yürür, öğretmen yoksa "teacher" atlanır — kalıcı taslak "teacher"da
    // kalmışken liste boş gelse bile indeks kaybolmaz
    let i = ORDER.indexOf(step) + 1;
    while (ORDER[i] === "teacher" && !hasTutors()) i++;
    const to = ORDER[i];
    if (to) this.store().set({ step: to, backwards: false });
  }

  static back(): void {
    const { step } = this.store();
    let i = ALL_QUESTION_STEPS.indexOf(step) - 1;
    while (ALL_QUESTION_STEPS[i] === "teacher" && !hasTutors()) i--;
    if (i >= 0) this.store().set({ step: ALL_QUESTION_STEPS[i]!, backwards: true });
    else if (ALL_QUESTION_STEPS.includes(step)) this.store().set({ step: "intro", backwards: true });
  }

  /**
   * Öğretmen adımı açılınca: taslakta geçerli bir seçim yoksa sunucunun varsayılanı ön
   * seçilir (liste değişmiş, kayıtlı seçim artık yoksa da).
   */
  static preselectTutor(): void {
    const { tutors, defaultId } = useTutorsStore.getState();
    const current = this.store().tutorId;
    if (!tutors?.length) return;
    if (!current || !tutors.some((t) => t.id === current)) this.store().set({ tutorId: defaultId });
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
        // Sunucu yalnız aktif öğretmeni yazar, geçersizi sessizce yok sayar (varsayılana düşer)
        ...(o.tutorId ? { tutorId: o.tutorId } : {}),
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

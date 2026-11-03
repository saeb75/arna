import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CefrLevel, Interest, Track, TutorLanguage } from "@glotmate/contracts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OnboardingStep =
  | "intro"
  | "name"
  | "track"
  | "level"
  | "tutor"
  | "interests"
  | "occupation"
  | "goal"
  | "building"
  | "plan"
  | "notify";

/**
 * Onboarding taslağı — cihazda KALICI: uygulama kapanırsa kaldığı adımdan
 * döner. Sunucuya ancak "plan hazırlanıyor" adımında tek seferde gider
 * (POST /v1/onboarding). Yalnız OnboardingController yazar.
 */
interface OnboardingState {
  step: OnboardingStep;
  displayName: string;
  track: Track | null;
  level: CefrLevel | null;
  tutorLanguage: TutorLanguage | null;
  interests: Interest[];
  occupation: string;
  dailyGoal: 5 | 10 | 15 | null;
  /** "HH:MM" ya da null (hatırlatma yok) */
  reminderTime: string | null;
  /** Sunucuya yazıldı — "plan" adımı ve sonrası */
  submitted: boolean;
  /** Son geçiş geriye mi (sayfa kayması yerine yumuşak geçiş) */
  backwards: boolean;
  set: (p: Partial<Omit<OnboardingState, "set" | "reset">>) => void;
  reset: () => void;
}

const initial = {
  step: "intro" as OnboardingStep,
  displayName: "",
  track: null,
  level: null,
  tutorLanguage: "native" as TutorLanguage,
  interests: [] as Interest[],
  occupation: "",
  dailyGoal: 10 as const,
  reminderTime: "20:00" as string | null,
  submitted: false,
  backwards: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      set: (p) => set(p),
      reset: () => set(initial),
    }),
    { name: "onboarding", storage: createJSONStorage(() => AsyncStorage), partialize: ({ set: _s, reset: _r, ...rest }) => rest },
  ),
);

import { View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, SlideInRight, SlideOutLeft, useReducedMotion } from "react-native-reanimated";
import { OnboardingController, QUESTION_STEPS } from "../../controllers/OnboardingController";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { BuildingStep } from "./BuildingStep";
import { GoalStep } from "./GoalStep";
import { InterestsStep } from "./InterestsStep";
import { IntroFlip } from "./IntroFlip";
import { LevelStep } from "./LevelStep";
import { NameStep } from "./NameStep";
import { NotifyStep } from "./NotifyStep";
import { OccupationStep } from "./OccupationStep";
import { PlanStep } from "./PlanStep";
import { TrackStep } from "./TrackStep";
import { TutorStep } from "./TutorStep";

/**
 * İLK AÇILIŞ, baştan sona: tanıtım sayfaları (nokta çevirmesi) → sorular
 * (kayan sayfalar + ilerleme) → plan hazırlanıyor → plan (üstünde paywall) →
 * hatırlatıcı → dersler. Adım store'da, cihazda kalıcı.
 */
export function OnboardingScreen() {
  const reduceMotion = useReducedMotion();
  const step = useOnboardingStore((s) => s.step);
  // Geri giderken kayma yerine yumuşak geçiş
  const backwards = useOnboardingStore((s) => s.backwards);

  if (step === "intro") {
    return (
      <IntroFlip
        onDone={() => OnboardingController.next()}
        onHaveAccount={() => OnboardingController.haveAccount()}
      />
    );
  }

  const q = QUESTION_STEPS.indexOf(step);
  const shell = {
    progress: q >= 0 ? (q + 1) / QUESTION_STEPS.length : 1,
    index: q + 1,
    total: QUESTION_STEPS.length,
    onBack: () => OnboardingController.back(),
  };
  const enterAnim =
    reduceMotion || backwards ? FadeIn.duration(260) : SlideInRight.duration(380).easing(Easing.out(Easing.cubic));
  const exitAnim =
    reduceMotion || backwards ? FadeOut.duration(180) : SlideOutLeft.duration(320).easing(Easing.in(Easing.cubic));

  return (
    <View className="flex-1 bg-canvas">
      <Animated.View key={step} entering={enterAnim} exiting={exitAnim} className="absolute inset-0">
        {step === "name" ? (
          <NameStep shell={shell} />
        ) : step === "track" ? (
          <TrackStep shell={shell} />
        ) : step === "level" ? (
          <LevelStep shell={shell} />
        ) : step === "tutor" ? (
          <TutorStep shell={shell} />
        ) : step === "interests" ? (
          <InterestsStep shell={shell} />
        ) : step === "occupation" ? (
          <OccupationStep shell={shell} />
        ) : step === "goal" ? (
          <GoalStep shell={shell} />
        ) : step === "building" ? (
          <BuildingStep />
        ) : step === "plan" ? (
          <PlanStep />
        ) : (
          <NotifyStep />
        )}
      </Animated.View>
    </View>
  );
}

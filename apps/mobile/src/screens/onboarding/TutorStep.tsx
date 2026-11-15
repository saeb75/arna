import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Globe, Languages } from "lucide-react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { OptionCard } from "../../components/ui/OptionCard";
import { OnboardingController } from "../../controllers/OnboardingController";
import { DEFAULT_NATIVE_LANGUAGE, languageName } from "../../domain/language";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { QuestionShell, rise, type ShellProps } from "./QuestionShell";

/** Açıklama dili (öğretmen SEÇİMİ değil — o TeacherStep) — native: hoca kuralları ana dilde anlatır; english: tam daldırma. */
export function TutorStep({ shell }: { shell: ShellProps }) {
  const colors = useThemeColors();
  const tutor = useOnboardingStore((s) => s.tutorLanguage);
  const tutorName = useDraftTutorName();
  // Dokunuş yalnız SEÇER, ilerleme "Devam" ile (15 Kas 2026: kendiliğinden geçiş kaldırıldı)
  const pick = (tutorLanguage: "native" | "english") => OnboardingController.answer({ tutorLanguage });
  return (
    <QuestionShell
      {...shell}
      title={tr.onboarding.tutor.title(tutorName)}
      body={tr.onboarding.tutor.body}
      footer={<CtaButton label={tr.common.continue} disabled={!tutor} onPress={() => OnboardingController.next()} />}
    >
      <View className="gap-3 px-6">
        <Animated.View entering={rise(2)}>
          <OptionCard
              glass
            title={tr.tutorLanguage.native(languageName(DEFAULT_NATIVE_LANGUAGE))}
            subtitle={tr.tutorLanguage.nativeBody}
            icon={<Languages color={colors.brand} size={22} />}
            selected={tutor === "native"}
            onPress={() => pick("native")}
          />
        </Animated.View>
        <Animated.View entering={rise(3)}>
          <OptionCard
              glass
            title={tr.tutorLanguage.english}
            subtitle={tr.tutorLanguage.englishBody}
            icon={<Globe color={colors.brand} size={22} />}
            selected={tutor === "english"}
            onPress={() => pick("english")}
          />
        </Animated.View>
      </View>
    </QuestionShell>
  );
}

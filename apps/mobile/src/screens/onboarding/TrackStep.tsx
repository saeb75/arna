import { ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { TRACKS } from "@glotmate/contracts";
import { CtaButton } from "../../components/ui/CtaButton";
import { OptionCard } from "../../components/ui/OptionCard";
import { OnboardingController } from "../../controllers/OnboardingController";
import { TRACK_ICON } from "../../domain/tracks";
import { tr } from "../../i18n/tr";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { QuestionShell, rise, type ShellProps } from "./QuestionShell";

/** Konuşma bağlamı — dokunuş yalnız SEÇER, ilerleme "Devam" ile (15 Kas 2026: kendiliğinden geçiş kaldırıldı). */
export function TrackStep({ shell }: { shell: ShellProps }) {
  const colors = useThemeColors();
  const track = useOnboardingStore((s) => s.track);
  return (
    <QuestionShell
      {...shell}
      title={tr.onboarding.track.title}
      body={tr.onboarding.track.body}
      footer={<CtaButton label={tr.common.continue} disabled={!track} onPress={() => OnboardingController.next()} />}
    >
      <ScrollView contentContainerClassName="gap-3 px-6 pb-8">
        {TRACKS.map((key, i) => {
          const Icon = TRACK_ICON[key];
          return (
            <Animated.View key={key} entering={rise(i + 2)}>
              <OptionCard
              glass
                title={tr.tracks[key].title}
                subtitle={tr.tracks[key].subtitle}
                icon={<Icon color={colors.brand} size={22} />}
                selected={track === key}
                onPress={() => OnboardingController.answer({ track: key })}
              />
            </Animated.View>
          );
        })}
      </ScrollView>
    </QuestionShell>
  );
}

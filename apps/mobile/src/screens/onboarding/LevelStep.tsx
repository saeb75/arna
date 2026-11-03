import { Pressable, ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { CEFR_LEVELS } from "@glotmate/contracts";
import { CtaButton } from "../../components/ui/CtaButton";
import { OnboardingController } from "../../controllers/OnboardingController";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { QuestionShell, rise, type ShellProps } from "./QuestionShell";

/**
 * Seviye — A1–C2 kartları, seçilende "Kulağa şöyle gelir" örneği açılır.
 * Yerleştirme testi YOK (MVP kararı); ayarlardan her zaman değişir.
 */
export function LevelStep({ shell }: { shell: ShellProps }) {
  const colors = useThemeColors();
  const level = useOnboardingStore((s) => s.level);
  return (
    <QuestionShell
      {...shell}
      title={tr.onboarding.level.title}
      body={tr.onboarding.level.body}
      footer={<CtaButton label={tr.common.continue} disabled={!level} onPress={() => OnboardingController.next()} />}
    >
      <ScrollView contentContainerClassName="gap-2.5 px-6 pb-6">
        {CEFR_LEVELS.map((key, i) => {
          const selected = level === key;
          const copy = tr.levels[key];
          return (
            <Animated.View key={key} entering={rise(i + 2)}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => {
                  HapticsService.tap();
                  OnboardingController.answer({ level: key });
                }}
                className={`gap-3 rounded-2xl border-2 px-4 py-3.5 active:opacity-80 ${selected ? "border-brand bg-brand/10" : "border-border bg-card"}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`h-8 min-w-11 items-center justify-center rounded-lg px-2 ${selected ? "bg-brand" : "bg-muted"}`}>
                    <Text className={`text-sm font-extrabold ${selected ? "text-on-brand" : "text-foreground"}`}>{key}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-semibold text-foreground">{copy.name}</Text>
                    <Text className="text-sm text-muted-foreground">{copy.line}</Text>
                  </View>
                  <View className={`size-6 items-center justify-center rounded-full border-2 ${selected ? "border-brand bg-brand" : "border-border"}`}>
                    {selected ? <Check color={colors["on-brand"]} size={14} strokeWidth={3.2} /> : null}
                  </View>
                </View>
                {selected ? (
                  <Animated.View entering={rise(0)} className="rounded-xl bg-card px-3 py-2.5">
                    <Text className="text-xs font-semibold text-muted-foreground">{tr.levels.samplePrefix}</Text>
                    <Text className="mt-0.5 text-[15px] italic text-foreground">“{copy.sample}”</Text>
                  </Animated.View>
                ) : null}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </QuestionShell>
  );
}

import { Pressable, ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { INTEREST_AREAS } from "@glotmate/contracts";
import { CtaButton } from "../../components/ui/CtaButton";
import { OnboardingController } from "../../controllers/OnboardingController";
import { INTEREST_ICON } from "../../domain/interests";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { QuestionShell, rise, type ShellProps } from "./QuestionShell";

/** İlgi alanları — iki sütun karo, 1–8 seçim (sözleşme sınırı). */
export function InterestsStep({ shell }: { shell: ShellProps }) {
  const colors = useThemeColors();
  const picked = useOnboardingStore((s) => s.interests);
  return (
    <QuestionShell
      {...shell}
      title={tr.onboarding.interests.title}
      body={tr.onboarding.interests.body}
      footer={<CtaButton label={tr.onboarding.interests.cta(picked.length)} disabled={!picked.length} onPress={() => OnboardingController.next()} />}
    >
      <ScrollView contentContainerClassName="flex-row flex-wrap justify-between gap-y-3 px-6 pb-6">
        {INTEREST_AREAS.map((key, i) => {
          const Icon = INTEREST_ICON[key];
          const on = picked.includes(key);
          return (
            <Animated.View key={key} entering={rise(Math.min(i, 8) + 2)} className="w-[48.5%]">
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  HapticsService.selection();
                  OnboardingController.toggleInterest(key);
                }}
                className={`h-[92px] justify-between rounded-2xl border-2 p-3 active:opacity-80 ${on ? "border-brand bg-brand/10" : "border-border bg-card"}`}
              >
                <View className="flex-row items-start justify-between">
                  <View className={`size-9 items-center justify-center rounded-xl ${on ? "bg-brand" : "bg-muted"}`}>
                    <Icon color={on ? colors["on-brand"] : colors.brand} size={18} />
                  </View>
                  <View className={`size-5 items-center justify-center rounded-md border-2 ${on ? "border-brand bg-brand" : "border-border"}`}>
                    {on ? <Check color={colors["on-brand"]} size={12} strokeWidth={3.4} /> : null}
                  </View>
                </View>
                <Text numberOfLines={1} className="text-[15px] font-semibold text-foreground">
                  {tr.interests[key]}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </QuestionShell>
  );
}

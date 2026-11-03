import { Pressable, ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Coffee, Flame, Footprints, type LucideIcon } from "lucide-react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { OptionCard } from "../../components/ui/OptionCard";
import { OnboardingController } from "../../controllers/OnboardingController";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { QuestionShell, rise, type ShellProps } from "./QuestionShell";

const GOALS: { min: 5 | 10 | 15; Icon: LucideIcon }[] = [
  { min: 5, Icon: Coffee },
  { min: 10, Icon: Footprints },
  { min: 15, Icon: Flame },
];
const REMINDERS = ["08:00", "13:00", "20:00"] as const;

/** Günlük hedef (10 önerilen) + ne zaman hatırlatılacağı. */
export function GoalStep({ shell }: { shell: ShellProps }) {
  const colors = useThemeColors();
  const goal = useOnboardingStore((s) => s.dailyGoal);
  const reminder = useOnboardingStore((s) => s.reminderTime);
  const chip = (value: string | null, label: string) => {
    const on = reminder === value;
    return (
      <Pressable
        key={label}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        onPress={() => {
          HapticsService.selection();
          OnboardingController.answer({ reminderTime: value });
        }}
        className={`h-10 items-center justify-center rounded-full border px-4 active:opacity-70 ${on ? "border-brand bg-brand" : "border-border bg-card"}`}
      >
        <Text className={`text-sm font-semibold ${on ? "text-on-brand" : "text-foreground"}`}>{label}</Text>
      </Pressable>
    );
  };
  return (
    <QuestionShell
      {...shell}
      title={tr.onboarding.goal.title}
      body={tr.onboarding.goal.body}
      footer={<CtaButton label={tr.common.continue} disabled={!goal} onPress={() => OnboardingController.next()} />}
    >
      <ScrollView contentContainerClassName="gap-3 px-6 pb-6">
        {GOALS.map(({ min, Icon }, i) => (
          <Animated.View key={min} entering={rise(i + 2)}>
            <OptionCard
              title={tr.onboarding.goal.options[min].title}
              subtitle={tr.onboarding.goal.options[min].body}
              icon={<Icon color={colors.brand} size={22} />}
              selected={goal === min}
              onPress={() => OnboardingController.answer({ dailyGoal: min })}
              trailing={
                min === 10 ? (
                  <View className="rounded-full bg-brand/15 px-2 py-1">
                    <Text className="text-[11px] font-bold text-brand">{tr.onboarding.goal.recommended}</Text>
                  </View>
                ) : undefined
              }
            />
          </Animated.View>
        ))}
        <Animated.View entering={rise(6)} className="mt-3 gap-3">
          <Text className="text-base font-bold text-foreground">{tr.onboarding.goal.reminderTitle}</Text>
          <View className="flex-row flex-wrap gap-2">
            {REMINDERS.map((time) => chip(time, `${tr.onboarding.goal.reminders[time]} · ${time}`))}
            {chip(null, tr.onboarding.goal.noReminder)}
          </View>
        </Animated.View>
      </ScrollView>
    </QuestionShell>
  );
}

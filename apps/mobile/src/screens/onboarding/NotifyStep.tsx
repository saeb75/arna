import { useState } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, GraduationCap } from "lucide-react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { TextButton } from "../../components/ui/TextButton";
import { OnboardingController } from "../../controllers/OnboardingController";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";

/** iOS'un izin sorusundan ÖNCE: neden (seri), göndereceği hatırlatmanın önizlemesiyle. */
export function NotifyStep() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const goal = useOnboardingStore((s) => s.dailyGoal ?? 10);
  const tutorName = useDraftTutorName();
  const [busy, setBusy] = useState(false);
  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas px-6" style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 12 }}>
      <ScreenGlow height={520} />
      <View className="flex-1 items-center justify-center gap-8">
        <Animated.View entering={enter(0)} className="size-36 items-center justify-center rounded-full bg-brand/10">
          <View className="size-24 items-center justify-center rounded-full bg-brand/20">
            <Bell color={colors.brand} size={44} strokeWidth={2} />
          </View>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(500).duration(520).easing(Easing.out(Easing.cubic))}
          className="w-full flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
          style={{ shadowColor: colors.scrim, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }}
        >
          <View className="size-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap color={colors["primary-foreground"]} size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-foreground">{tr.onboarding.notify.previewTitle(goal)}</Text>
            <Text className="text-sm text-muted-foreground">{tr.onboarding.notify.previewBody(tutorName)}</Text>
          </View>
        </Animated.View>
        <View className="gap-2">
          <Animated.Text entering={enter(2)} className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            {tr.onboarding.notify.title}
          </Animated.Text>
          <Animated.Text entering={enter(3)} className="text-center text-base leading-snug text-muted-foreground">
            {tr.onboarding.notify.body}
          </Animated.Text>
        </View>
      </View>
      <View className="gap-1">
        <CtaButton
          label={tr.onboarding.notify.cta}
          busy={busy}
          onPress={async () => {
            setBusy(true);
            await OnboardingController.enableReminder();
            setBusy(false);
          }}
        />
        <TextButton center label={tr.onboarding.notify.skip} onPress={() => OnboardingController.finish()} />
      </View>
    </View>
  );
}

import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarCheck, Clock, Gauge, Languages, MessageCircle, type LucideIcon } from "lucide-react-native";
import { CountUp } from "../../components/ui/CountUp";
import { CtaButton } from "../../components/ui/CtaButton";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { OnboardingController } from "../../controllers/OnboardingController";
import { DEFAULT_NATIVE_LANGUAGE, languageName } from "../../domain/language";
import { tr } from "../../i18n/tr";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";

/** Kişisel plan: seviye, hedef, açıklama dili, bağlam — ve bir ayın toplamı. Eylemi: paywall. */
export function PlanStep() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const o = useOnboardingStore();
  const goal = o.dailyGoal ?? 10;
  const sessions = Math.round((goal * 30) / 7);
  const rows: { Icon: LucideIcon; label: string; value: ReactNode }[] = [
    {
      Icon: Gauge,
      label: tr.onboarding.plan.level,
      value: (
        <View className="rounded-full bg-brand/15 px-3 py-1">
          <Text className="text-sm font-bold text-brand">
            {o.level} · {o.level ? tr.levels[o.level].name : ""}
          </Text>
        </View>
      ),
    },
    { Icon: Clock, label: tr.onboarding.plan.goal, value: <Text className="text-base font-bold text-foreground">{tr.common.minutesLong(goal)}</Text> },
    {
      Icon: Languages,
      label: tr.onboarding.plan.tutor,
      value: (
        <Text className="text-base font-bold text-foreground">
          {o.tutorLanguage === "english" ? tr.tutorLanguage.english : tr.tutorLanguage.nativeShort(languageName(DEFAULT_NATIVE_LANGUAGE))}
        </Text>
      ),
    },
    {
      Icon: MessageCircle,
      label: tr.onboarding.plan.context,
      value: <Text className="text-base font-bold text-foreground">{o.track ? tr.tracks[o.track].title : ""}</Text>,
    },
  ];
  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 12 }}>
      <ScreenGlow height={460} />
      <ScrollView contentContainerClassName="gap-6 px-6 pb-6">
        <View className="gap-2 pt-4">
          <Animated.Text entering={enter(0)} className="text-xs font-bold tracking-widest text-brand">
            {tr.onboarding.plan.eyebrow}
          </Animated.Text>
          <Animated.Text entering={enter(1)} className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            {tr.onboarding.plan.title(o.displayName.trim())}
          </Animated.Text>
          <Animated.Text entering={enter(2)} className="text-lg leading-snug text-muted-foreground">
            {tr.onboarding.plan.body}
          </Animated.Text>
        </View>
        <View className="overflow-hidden rounded-3xl border border-border bg-card px-4">
          {rows.map(({ Icon, label, value }, i) => (
            <Animated.View key={label} entering={enter(i + 3)} className={`flex-row items-center gap-3 py-3.5 ${i ? "border-t border-border" : ""}`}>
              <View className="size-10 items-center justify-center rounded-xl bg-brand/15">
                <Icon color={colors.brand} size={20} />
              </View>
              <Text className="flex-1 text-[15px] text-muted-foreground">{label}</Text>
              {value}
            </Animated.View>
          ))}
        </View>
        <Animated.View entering={enter(7)} className="flex-row items-center gap-4 rounded-3xl bg-brand/10 p-4">
          <View className="size-14 items-center justify-center rounded-2xl bg-brand">
            <CalendarCheck color={colors["on-brand"]} size={26} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-muted-foreground">{tr.onboarding.plan.projectionLead}</Text>
            <View className="flex-row flex-wrap items-baseline">
              <CountUp to={sessions} delay={900} className="text-3xl font-extrabold text-brand" />
              <Text className="ml-2 flex-1 text-[15px] leading-snug text-foreground">{tr.onboarding.plan.projection}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      <View className="px-6 pt-2" style={{ paddingBottom: insets.bottom + 12 }}>
        <CtaButton label={tr.onboarding.plan.cta} onPress={() => void OnboardingController.afterPlan()} breathe />
      </View>
    </View>
  );
}

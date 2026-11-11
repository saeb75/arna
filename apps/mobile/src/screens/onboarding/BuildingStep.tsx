import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { CountUp } from "../../components/ui/CountUp";
import { CtaButton } from "../../components/ui/CtaButton";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { OnboardingController } from "../../controllers/OnboardingController";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

const ITEM_COUNT = tr.onboarding.building.items("").length;
const STEP_MS = 650;

/**
 * "Planın hazırlanıyor": halka dolarken dört madde tiklenir. Arkada GERÇEK iş
 * koşar — POST /v1/onboarding. İkisi birlikte bitince kendiliğinden ilerler;
 * istek düşerse animasyon "tekrar dene"ye döner (profil yazılmadan uygulamaya
 * girilmez).
 */
export function BuildingStep() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const items = tr.onboarding.building.items(useDraftTutorName());
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitted = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    setFailed(false);
    setDone(0);
    submitted.current = OnboardingController.submit();
    const timers = Array.from({ length: ITEM_COUNT }, (_, i) =>
      setTimeout(() => {
        HapticsService.tap();
        setDone(i + 1);
      }, 500 + (i + 1) * STEP_MS),
    );
    timers.push(
      setTimeout(async () => {
        const ok = await submitted.current;
        if (ok) OnboardingController.next();
        else setFailed(true);
      }, 500 + ITEM_COUNT * STEP_MS + 900),
    );
    return () => timers.forEach(clearTimeout);
  }, [attempt]);

  const total = 500 + ITEM_COUNT * STEP_MS;
  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 items-center justify-center bg-canvas px-8" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 12 }}>
      <ScreenGlow height={520} />
      <ProgressRing key={attempt} value={1} size={176} stroke={14} delay={150} duration={total}>
        <CountUp key={attempt} to={100} duration={total} delay={150} format={(v) => `${Math.round(v)}%`} className="text-4xl font-extrabold text-foreground" />
      </ProgressRing>
      <Animated.Text entering={FadeInDown.delay(200).duration(420)} className="mt-8 text-center text-2xl font-extrabold tracking-tight text-foreground">
        {failed ? tr.onboarding.building.failed : done >= ITEM_COUNT ? tr.onboarding.building.done : tr.onboarding.building.title}
      </Animated.Text>
      <View className="mt-6 w-full gap-3">
        {items.map((item, i) => {
          const ok = done > i;
          return (
            <Animated.View
              key={item}
              entering={FadeInDown.delay(300 + i * 120).duration(420).easing(Easing.out(Easing.cubic))}
              className="flex-row items-center gap-3"
            >
              <View className={`size-7 items-center justify-center rounded-full ${ok ? "bg-positive" : "bg-muted"}`}>
                {ok ? (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Check color={colors["on-brand"]} size={16} strokeWidth={3.2} />
                  </Animated.View>
                ) : null}
              </View>
              <Text className={`flex-1 text-base ${ok ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{item}</Text>
            </Animated.View>
          );
        })}
      </View>
      {failed ? (
        <View className="mt-8 w-full">
          <CtaButton label={tr.common.retry} onPress={() => setAttempt((a) => a + 1)} />
        </View>
      ) : null}
    </View>
  );
}

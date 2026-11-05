import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brain, Infinity as InfinityIcon, MessageSquareQuote, Drama, X } from "lucide-react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { Skeleton } from "../../components/ui/Skeleton";
import { PaywallController, type PaywallSource } from "../../controllers/PaywallController";
import { savingsPct } from "../../domain/pro";
import { tr } from "../../i18n/tr";
import { useProStore } from "../../stores/useProStore";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";
import { FeatureRow } from "./FeatureRow";
import { LegalFooter } from "./LegalFooter";
import { PaywallHero } from "./PaywallHero";
import { ctaLabel, planNote, planTitle, termsLine } from "./planText";
import { PlanRow } from "./PlanRow";

const FEATURE_ICONS = [InfinityIcon, Drama, Brain, MessageSquareQuote];

/**
 * GlotMate Pro: kart yelpazesi, Pro'nun açtıkları, offering planları (mağaza
 * fiyatlarıyla; deneme yalnız bu Apple ID'ye vaat edilebiliyorsa), nefes alan
 * tek eylem, mağaza şartları ve bağlantılar. Kotadan açıldıysa başlık bunu söyler.
 */
export function PaywallScreen({ source }: { source: PaywallSource }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const plans = useProStore((s) => s.plans);
  const purchasing = useProStore((s) => s.purchasing);
  const restoring = useProStore((s) => s.restoring);
  const preview = useProStore((s) => s.preview);
  const [key, setKey] = useState<string | null>(null);
  const [heroSpace, setHeroSpace] = useState(0);
  const chosen = plans?.find((p) => p.key === key) ?? plans?.[0];

  useEffect(() => {
    PaywallController.mounted();
    void PaywallController.load();
    return () => PaywallController.unmounted();
  }, []);

  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 8) + 6 }}>
      <ScreenGlow height={480} />
      <View className="flex-row items-center justify-between px-4">
        {/* Kapat bir nefes sonra belirir: sayfa kapatılmadan önce okunsun */}
        <Animated.View entering={FadeIn.delay(1200).duration(400)}>
          <RoundIconButton variant="muted" icon={<X color={colors["muted-foreground"]} size={20} />} label={tr.common.close} onPress={() => PaywallController.close()} />
        </Animated.View>
        <Pressable accessibilityRole="button" disabled={restoring} onPress={() => void PaywallController.restore()} hitSlop={10} className="active:opacity-60">
          <Text className="text-sm font-semibold text-muted-foreground">{tr.paywall.restore}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="flex-grow" bounces={false} showsVerticalScrollIndicator={false}>
        <View className="min-h-[120px] flex-1 justify-center" onLayout={(e) => setHeroSpace(e.nativeEvent.layout.height)}>
          {heroSpace > 0 ? <PaywallHero width={width} height={heroSpace - 8} /> : null}
        </View>

        <View className="gap-5 px-6 pt-2">
          <View className="items-center gap-1.5">
            <Animated.Text entering={enter(0, 120)} accessibilityRole="header" className="text-center text-3xl font-extrabold leading-tight tracking-tight text-foreground">
              {tr.paywall.title}
            </Animated.Text>
            <Animated.Text entering={enter(1, 120)} className="text-center text-base text-muted-foreground">
              {tr.paywall.subtitle}
            </Animated.Text>
          </View>

          <View className="gap-2.5">
            {tr.paywall.features.map((text, i) => {
              const Icon = FEATURE_ICONS[i]!;
              return (
                <Animated.View key={text} entering={enter(2 + i, 120)}>
                  <FeatureRow icon={<Icon color={colors.brand} size={18} />} text={text} />
                </Animated.View>
              );
            })}
          </View>

          <Animated.View entering={enter(6, 120)} className="gap-3 pt-2" accessibilityRole="radiogroup">
            {!plans ? (
              <>
                <Skeleton className="h-[68px] rounded-2xl" />
                <Skeleton className="h-[68px] rounded-2xl" />
              </>
            ) : !plans.length ? (
              <View className="h-[68px] justify-center rounded-2xl border border-border bg-card px-4">
                <Text className="text-center text-sm text-muted-foreground">{tr.paywall.noPlans}</Text>
              </View>
            ) : (
              plans.map((plan) => {
                const save = savingsPct(plan, plans);
                return (
                  <PlanRow
                    key={plan.key}
                    title={planTitle(plan)}
                    note={planNote(plan)}
                    price={plan.price}
                    sub={plan.perWeek ? tr.paywall.perWeek(plan.perWeek) : null}
                    badge={save > 0 ? tr.paywall.save(save) : null}
                    selected={chosen?.key === plan.key}
                    onPress={() => setKey(plan.key)}
                  />
                );
              })
            )}
            {preview ? <Text className="text-center text-xs text-muted-foreground">{tr.paywall.preview}</Text> : null}
          </Animated.View>
        </View>
      </ScrollView>

      <View className="gap-2 px-6 pt-3">
        <CtaButton label={ctaLabel(chosen)} onPress={() => chosen && void PaywallController.purchase(chosen.key)} busy={purchasing} disabled={!chosen} breathe />
        <Text className="text-center text-xs font-medium text-foreground">{chosen ? termsLine(chosen) : " "}</Text>
        <LegalFooter onTerms={() => PaywallController.openLegal("terms")} onPrivacy={() => PaywallController.openLegal("privacy")} />
      </View>
    </View>
  );
}

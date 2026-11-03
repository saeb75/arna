import { ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Quote, X } from "lucide-react-native";
import type { RoleplayDebriefView } from "@glotmate/contracts";
import { RunsText } from "../../components/shared/RunsText";
import { Button } from "../../components/ui/Button";
import { CountUp } from "../../components/ui/CountUp";
import { CtaButton } from "../../components/ui/CtaButton";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { tr } from "../../i18n/tr";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Sahne sonu: halka X/Y, hedef başına öğrencinin BİREBİR sözü (kanıt), Emma'nın
 * en fazla üç notu. İkili "geçti/kaldı" etiketi YOK (sözleşme md. 3) — yalnız sayı.
 * Debrief gelmezse canlı listeden kurulur (koçluk boş).
 */
export function DebriefView({
  debrief,
  fallback,
  onAgain,
  onBack,
}: {
  debrief: RoleplayDebriefView | null;
  fallback: { id: string; label: string; done: boolean }[];
  onAgain: () => void;
  onBack: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const objectives = debrief?.objectives ?? fallback.map((o) => ({ ...o, evidence: null }));
  const done = objectives.filter((o) => o.done).length;
  const total = objectives.length;
  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 12 }}>
      <ScreenGlow height={480} />
      <ScrollView contentContainerClassName="gap-7 px-5 pb-6">
        <View className="items-center gap-2 pt-4">
          <ProgressRing value={total ? done / total : 0} size={152} stroke={13} color={done === total && total > 0 ? colors.positive : colors.brand} delay={150}>
            <View className="flex-row items-baseline">
              <CountUp to={done} delay={200} className="text-4xl font-extrabold text-foreground" />
              <Text className="text-xl font-bold text-muted-foreground">/{total}</Text>
            </View>
          </ProgressRing>
          <Animated.Text entering={enter(1)} className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {done >= Math.ceil(total / 2) ? tr.roleplay.debrief.great : tr.roleplay.debrief.good}
          </Animated.Text>
          <Animated.Text entering={enter(2)} className="text-center text-base text-muted-foreground">
            {tr.roleplay.debrief.body(done, total)}
          </Animated.Text>
        </View>

        <Animated.View entering={enter(3)} className="gap-3">
          <Text className="text-xl font-bold tracking-tight text-foreground">{tr.roleplay.debrief.goals}</Text>
          <View className="gap-2">
            {objectives.map((o) => (
              <View key={o.id} className={`gap-2 rounded-3xl border p-4 ${o.done ? "border-positive/30 bg-positive/10" : "border-border bg-card"}`}>
                <View className="flex-row items-center gap-3">
                  <View className={`size-7 items-center justify-center rounded-full ${o.done ? "bg-positive" : "bg-muted"}`}>
                    {o.done ? <Check color={colors["on-brand"]} size={15} strokeWidth={3.2} /> : <X color={colors["muted-foreground"]} size={14} strokeWidth={3} />}
                  </View>
                  <Text className="flex-1 text-base font-semibold text-foreground">{o.label}</Text>
                </View>
                {o.evidence ? (
                  <View className="ml-10 flex-row gap-2 rounded-2xl bg-card px-3 py-2">
                    <Quote color={colors.positive} size={14} />
                    <Text className="flex-1 text-[15px] italic text-foreground">{o.evidence}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </Animated.View>

        {debrief?.coaching.length ? (
          <Animated.View entering={enter(4)} className="gap-3">
            <Text className="text-xl font-bold tracking-tight text-foreground">{tr.roleplay.debrief.coaching}</Text>
            <View className="gap-2">
              {debrief.coaching.map((runs, i) => (
                <View key={i} className="flex-row gap-3 rounded-3xl border border-border bg-card p-4">
                  <View className="size-7 items-center justify-center rounded-full bg-brand/15">
                    <Text className="text-sm font-extrabold text-brand">{i + 1}</Text>
                  </View>
                  <RunsText runs={runs} className="flex-1 text-[15px]" />
                </View>
              ))}
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
      <View className="gap-1 px-5 pt-2" style={{ paddingBottom: insets.bottom + 12 }}>
        <CtaButton label={tr.roleplay.debrief.back} onPress={onBack} />
        <Button label={tr.roleplay.debrief.again} variant="ghost" onPress={onAgain} />
      </View>
    </View>
  );
}

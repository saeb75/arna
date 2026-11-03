import { Pressable, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { router } from "expo-router";
import { ChevronRight, HeartCrack, Trophy } from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import { CountUp } from "../../components/ui/CountUp";
import { CtaButton } from "../../components/ui/CtaButton";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { tr } from "../../i18n/tr";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";

interface CheckpointResultProps {
  unitIndex: number;
  /** Canlar tüketilmeden bitirildi mi — rozetin tek şartı (checkpointPassed) */
  passed: boolean;
  score: number;
  total: number;
  /** Yanlış yapılan maddelerin geldiği dersler — test kapı değil AYNA */
  weakLessonIds: string[];
  saveError: string | null;
  onRetry: () => void;
}

/** Ders kimliğinden okunabilir başlık: "a1-she-works-at-night" → "She works at night" */
function readable(lessonId: string): string {
  const s = lessonId.replace(/^[a-c][12]-/, "").replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CheckpointResult({ unitIndex, passed, score, total, weakLessonIds, saveError, onRetry }: CheckpointResultProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 justify-center gap-7 px-6">
      <ScreenGlow height={460} />
      <View className="items-center gap-2">
        <ProgressRing value={total ? score / total : 0} size={168} stroke={14} color={passed ? colors.positive : colors.brand} delay={200}>
          <Animated.View entering={ZoomIn.delay(250).duration(420)} className="items-center">
            {passed ? <Trophy color={colors.positive} size={30} /> : <HeartCrack color={colors.negative} size={30} />}
            <View className="flex-row items-baseline">
              <CountUp to={score} delay={300} className="text-4xl font-extrabold text-foreground" />
              <Text className="text-xl font-bold text-muted-foreground">/{total}</Text>
            </View>
          </Animated.View>
        </ProgressRing>
        <Animated.Text entering={enter(1)} className="mt-3 text-xs font-bold tracking-widest text-brand">
          {tr.checkpoint.resultEyebrow(unitIndex)}
        </Animated.Text>
        <Animated.Text entering={enter(2)} className="text-3xl font-extrabold tracking-tight text-foreground">
          {passed ? tr.checkpoint.passed : tr.checkpoint.failed}
        </Animated.Text>
        <Animated.Text entering={enter(3)} className="text-center text-base leading-snug text-muted-foreground">
          {passed ? tr.checkpoint.passedBody : tr.checkpoint.failedBody}
        </Animated.Text>
      </View>

      {weakLessonIds.length > 0 && (
        <Animated.View entering={enter(4)} className="gap-1 rounded-3xl border border-border bg-card p-2">
          <Text className="px-2 pb-1 pt-2 text-sm font-semibold text-muted-foreground">{tr.checkpoint.review}</Text>
          {weakLessonIds.map((id) => (
            <Pressable key={id} onPress={() => router.replace(`/lesson/${id}`)} className="flex-row items-center gap-2 rounded-2xl px-2 py-3 active:bg-muted">
              <Text className="flex-1 text-base font-medium text-foreground">{readable(id)}</Text>
              <ChevronRight color={colors["muted-foreground"]} size={18} />
            </Pressable>
          ))}
        </Animated.View>
      )}

      {saveError && <Text className="text-center text-xs text-muted-foreground">{tr.checkpoint.saveFailed}</Text>}

      <Animated.View entering={enter(5)} className="gap-2">
        <CtaButton label={tr.checkpoint.backToLessons} onPress={() => router.replace("/lessons")} />
        {/* Sunucu her derlemede farklı örneklem veriyor — gerçekten yeni sorular */}
        <Button label={tr.checkpoint.retry} variant="ghost" onPress={onRetry} />
      </Animated.View>
    </View>
  );
}

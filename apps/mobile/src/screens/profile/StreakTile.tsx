import { Text, View } from "react-native";
import { Flame, Trophy } from "lucide-react-native";
import { CountUp } from "../../components/ui/CountUp";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/** Seri, büyük: art arda günler + bugünün notu, yanında en iyi seri. */
export function StreakTile({ streak, best, goalMet }: { streak: number; best: number; goalMet: boolean }) {
  const colors = useThemeColors();
  const lit = streak > 0;
  const note = goalMet ? tr.profile.streakDone : lit ? tr.profile.streakKeep : tr.profile.streakStart;
  return (
    <View accessible accessibilityLabel={`${tr.home.streak(streak)}. ${note}`} className="flex-row items-center gap-4 rounded-3xl border border-border bg-card p-4">
      <View className={`size-14 items-center justify-center rounded-2xl ${lit ? "bg-streak/15" : "bg-muted"}`}>
        <Flame color={lit ? colors.streak : colors["muted-foreground"]} fill={lit ? colors.streak : "transparent"} size={28} />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-baseline gap-x-1.5">
          <CountUp to={streak} className="text-4xl font-extrabold tracking-tight text-foreground" />
          <Text className="text-base font-semibold text-foreground">{tr.profile.streakDays(streak)}</Text>
        </View>
        <Text className="text-sm leading-snug text-muted-foreground">{note}</Text>
      </View>
      <View className="min-w-16 items-center gap-0.5 rounded-2xl bg-muted px-3 py-2.5">
        <Trophy color={colors.warning} size={18} strokeWidth={2.2} />
        <CountUp to={best} delay={120} className="text-xl font-extrabold text-foreground" />
        <Text className="text-[10px] font-bold tracking-widest text-muted-foreground">{tr.profile.best}</Text>
      </View>
    </View>
  );
}

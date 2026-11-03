import { Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/** Günlük seri hapı — seri varsa alev dolu ve turuncu. */
export function StreakPill({ streak }: { streak: number }) {
  const colors = useThemeColors();
  const lit = streak > 0;
  return (
    <View
      accessible
      accessibilityLabel={tr.home.streak(streak)}
      className="h-12 flex-row items-center gap-1.5 rounded-full border border-border bg-card px-4"
    >
      <Flame color={lit ? colors.streak : colors["muted-foreground"]} fill={lit ? colors.streak : "transparent"} size={20} />
      <Text className="text-base font-bold tabular-nums text-foreground">{streak}</Text>
    </View>
  );
}

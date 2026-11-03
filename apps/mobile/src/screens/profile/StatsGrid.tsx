import { View } from "react-native";
import { Clock, Drama, GraduationCap } from "lucide-react-native";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Skeleton } from "../../components/ui/Skeleton";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { StatTile } from "./StatTile";
import { StreakTile } from "./StreakTile";

/** İlerleme: seri (+ en iyi), sonra toplam dakika, biten dersler, rol yapmalar. */
export function StatsGrid() {
  const colors = useThemeColors();
  const stats = useMeStore((s) => s.stats);
  return (
    <View className="gap-3">
      <SectionHeader title={tr.profile.stats} />
      {!stats ? (
        <>
          <Skeleton className="h-[90px] rounded-3xl" />
          <View className="flex-row gap-3">
            <Skeleton className="h-[104px] flex-1 rounded-2xl" />
            <Skeleton className="h-[104px] flex-1 rounded-2xl" />
            <Skeleton className="h-[104px] flex-1 rounded-2xl" />
          </View>
        </>
      ) : (
        <>
          <StreakTile streak={stats.streak} best={stats.bestStreak} goalMet={stats.todayMinutes >= stats.dailyGoalMinutes} />
          <View className="flex-row gap-3">
            <StatTile icon={Clock} color={colors.brand} tint="bg-brand/15" value={stats.totalMinutes} label={tr.profile.minutes} delay={80} />
            <StatTile icon={GraduationCap} color={colors.info} tint="bg-info/15" value={stats.lessonsCompleted} label={tr.profile.lessons} delay={140} />
            <StatTile icon={Drama} color={colors.positive} tint="bg-positive/15" value={stats.roleplaysCompleted} label={tr.profile.roleplays} delay={200} />
          </View>
        </>
      )}
    </View>
  );
}

import { Pressable, Text, View } from "react-native";
import { Check, ChevronRight } from "lucide-react-native";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Bugün + neredesin: solda günlük hedef halkası (dakika), sağda kaydırmayı
 * izleyen seviye/ünite bağlamı. Dokunuş kaldığın derse geri kaydırır.
 * Yükseklik SABİT 84 (yolun üst boşluğu buna göre hesaplanır).
 */
export function TodayCard({
  minutes,
  goal,
  topLine,
  title,
  onPress,
}: {
  minutes: number;
  goal: number;
  topLine: string;
  title: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const done = minutes >= goal;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tr.home.todayMinutes(Math.floor(minutes), goal)}. ${topLine}, ${title}`}
      onPress={onPress}
      className="h-[84px] flex-row items-center gap-3.5 rounded-3xl border border-border bg-card px-3.5 active:opacity-90"
    >
      <ProgressRing value={goal ? minutes / goal : 0} size={56} stroke={6} color={done ? colors.positive : colors.brand}>
        {done ? (
          <Check color={colors.positive} size={22} strokeWidth={3} />
        ) : (
          <Text className="text-sm font-extrabold tabular-nums text-foreground">{Math.floor(minutes)}</Text>
        )}
      </ProgressRing>
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-[11px] font-bold tracking-widest text-brand">
          {tr.home.today} · {done ? tr.home.goalDone : tr.home.todayMinutes(Math.floor(minutes), goal)}
        </Text>
        <Text numberOfLines={1} className="text-[17px] font-bold text-foreground">
          {title}
        </Text>
        <Text numberOfLines={1} className="text-[13px] text-muted-foreground">
          {topLine}
        </Text>
      </View>
      <ChevronRight color={colors["muted-foreground"]} size={22} />
    </Pressable>
  );
}

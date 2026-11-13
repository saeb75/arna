import { Pressable, Text, View } from "react-native";
import { ArrowRight, Check } from "lucide-react-native";
import { GradientFill } from "../../../components/ui/GradientFill";
import { ProgressRing } from "../../../components/ui/ProgressRing";
import { tr } from "../../../i18n/tr";
import { HapticsService } from "../../../services/HapticsService";
import { useThemeColors } from "../../../theme/useThemeColors";

/**
 * "Bugünkü ders" kartı: solda günlük hedef halkası (dakika), ortada kaldığın ders,
 * sağda gradyan "Devam/Başla" hapı — tek dokunuşla derse girer. Ders yoksa (seviye
 * bitti) hap görünmez. Yükseklik SABİT 84 (hero yüksekliği buna göre).
 */
export function JourneyTodayCard({
  minutes,
  goal,
  title,
  subtitle,
  action,
  onPress,
}: {
  minutes: number;
  goal: number;
  title: string;
  subtitle: string;
  /** null → eylem yok */
  action: string | null;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const done = minutes >= goal;
  return (
    <View className="h-[84px] flex-row items-center gap-3 rounded-[24px] border border-border bg-card px-3.5 shadow-md shadow-scrim/10">
      <View className="items-center gap-0.5">
        <ProgressRing value={goal ? minutes / goal : 0} size={50} stroke={5} color={done ? colors.positive : colors.brand}>
          {done ? (
            <Check color={colors.positive} size={18} strokeWidth={3} />
          ) : (
            <Text className="text-[12px] font-extrabold tabular-nums text-foreground">
              {Math.floor(minutes)}/{goal}
            </Text>
          )}
        </ProgressRing>
        <Text className="text-[9px] font-semibold text-muted-foreground">{tr.journey.minutesDone}</Text>
      </View>
      <View className="h-11 w-px bg-border" />
      <View className="flex-1 gap-0.5">
        <Text className="text-[11px] font-medium text-muted-foreground">{tr.journey.todayLesson}</Text>
        <Text numberOfLines={2} className="text-[15px] font-extrabold leading-[18px] text-foreground">
          {title}
        </Text>
        <Text numberOfLines={1} className="text-[11px] text-muted-foreground">
          {subtitle}
        </Text>
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${action}: ${title}`}
          onPress={() => {
            HapticsService.tap();
            onPress();
          }}
          className="h-10 flex-row items-center gap-1 overflow-hidden rounded-full px-3.5 shadow-md shadow-brand/30 active:opacity-90"
        >
          <GradientFill />
          <Text className="text-[14px] font-extrabold text-on-brand">{action}</Text>
          <ArrowRight color={colors["on-brand"]} size={15} strokeWidth={2.6} />
        </Pressable>
      ) : null}
    </View>
  );
}

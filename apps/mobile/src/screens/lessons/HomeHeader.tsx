import { Text, View } from "react-native";
import { Crown } from "lucide-react-native";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { StreakPill } from "../../components/shared/StreakPill";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/** Ana ekranın üstü: selam + başlık, seri hapı, (ücretsizde) Pro tacı. Yükseklik SABİT 52. */
export function HomeHeader({ name, streak, showPro, onPro }: { name: string; streak: number; showPro: boolean; onPro: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="h-[52px] flex-row items-center gap-2">
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-medium text-muted-foreground">
          {tr.home.greeting(name)}
        </Text>
        <Text numberOfLines={1} className="text-2xl font-extrabold tracking-tight text-foreground">
          {tr.home.title}
        </Text>
      </View>
      <StreakPill streak={streak} />
      {showPro ? <RoundIconButton icon={<Crown color={colors.brand} size={20} strokeWidth={2.4} />} label={tr.pro.bannerTitle} onPress={onPro} /> : null}
    </View>
  );
}

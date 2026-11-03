import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { Lightbulb } from "lucide-react-native";
import type { RichText } from "@glotmate/contracts";
import { RunsText } from "../../components/shared/RunsText";
import { useThemeColors } from "../../theme/useThemeColors";

/** İpucu kartı — uyarı tonlu, dil etiketli parçalar. */
export function HintCard({ hint, label }: { hint: RichText; label: string }) {
  const colors = useThemeColors();
  return (
    <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOut.duration(180)} className="mx-4 mb-2 flex-row gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3">
      <Lightbulb color={colors.warning} size={18} strokeWidth={2.4} />
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-bold tracking-wider text-warning">{label.toLocaleUpperCase("tr")}</Text>
        <RunsText runs={hint} className="text-[15px] leading-5" />
      </View>
    </Animated.View>
  );
}

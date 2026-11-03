import { Text, View } from "react-native";
import Animated, { LinearTransition, ZoomIn } from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Canlı hedef çipi — sunucu tiklediğinde (kanıtı öğrencinin sözünde birebir)
 * yeşile döner, onay işareti büyüyerek gelir. Karar istemcide DEĞİL.
 */
export function ObjectiveChip({ label, done }: { label: string; done: boolean }) {
  const colors = useThemeColors();
  return (
    <Animated.View
      layout={LinearTransition.duration(240)}
      className={`h-9 flex-row items-center gap-1.5 rounded-full border px-3 ${done ? "border-positive/40 bg-positive/15" : "border-border bg-card"}`}
    >
      <View className={`size-5 items-center justify-center rounded-full ${done ? "bg-positive" : "border-2 border-border"}`}>
        {done ? (
          <Animated.View entering={ZoomIn.duration(300)}>
            <Check color={colors["on-brand"]} size={12} strokeWidth={3.4} />
          </Animated.View>
        ) : null}
      </View>
      <Text numberOfLines={1} className={`text-[13px] font-semibold ${done ? "text-positive" : "text-foreground"}`}>
        {label}
      </Text>
    </Animated.View>
  );
}

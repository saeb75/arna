import { View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Heart } from "lucide-react-native";
import { CHECKPOINT_LIVES } from "@glotmate/contracts";
import { useThemeColors } from "../../theme/useThemeColors";

/** Kalan canlar — sayı contracts'tan (ekran kendi sabitini TUTMAZ). */
export function LivesRow({ left }: { left: number }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: CHECKPOINT_LIVES }, (_, i) => (
        <Animated.View key={`${i}-${i < left}`} entering={ZoomIn.duration(220)}>
          <Heart color={i < left ? colors.negative : colors["muted-foreground"]} fill={i < left ? colors.negative : "transparent"} size={20} />
        </Animated.View>
      ))}
    </View>
  );
}

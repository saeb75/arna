import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { AudioLines } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Avatar yokken (URL boş ya da sayfa yüklenemedi) konuşma göstergesi: Emma
 * konuşurken nefes alan bir hâle. Avatar bir süs — ders onsuz da aynen çalışır.
 */
export function SpeakingIndicator({ speaking, name = "Emma" }: { speaking: boolean; name?: string }) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (!speaking || reduceMotion) {
      pulse.value = withTiming(0, { duration: 200 });
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [speaking, reduceMotion, pulse]);
  const halo = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.22 }], opacity: 0.25 + pulse.value * 0.35 }));
  return (
    <View className="items-center gap-2 py-5">
      <View className="items-center justify-center">
        <Animated.View className="absolute size-20 rounded-full bg-brand/30" style={halo} />
        <View className={`size-16 items-center justify-center rounded-full ${speaking ? "bg-brand" : "bg-muted"}`}>
          <AudioLines color={speaking ? colors["on-brand"] : colors["muted-foreground"]} size={28} />
        </View>
      </View>
      <Text className="text-xs font-semibold text-muted-foreground">{speaking ? tr.lesson.speaking : name}</Text>
    </View>
  );
}

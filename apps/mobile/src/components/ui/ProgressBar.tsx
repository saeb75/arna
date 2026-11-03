import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

/** İnce ilerleme çubuğu — her yeni değere 600 ms ease-out ile akar. */
export function ProgressBar({
  value,
  className = "h-2",
  fillClass = "bg-brand",
  trackClass = "bg-muted",
}: {
  value: number;
  className?: string;
  fillClass?: string;
  trackClass?: string;
}) {
  const reduceMotion = useReducedMotion();
  const w = useSharedValue(0);
  useEffect(() => {
    const to = Math.max(0, Math.min(1, value));
    w.value = reduceMotion ? to : withTiming(to, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [value, reduceMotion, w]);
  // Animasyonlu genişlik sınıfla ifade edilemez — gerekçeli animasyonlu stil
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View className={`overflow-hidden rounded-full ${trackClass} ${className}`}>
      <Animated.View className={`h-full rounded-full ${fillClass}`} style={fill} />
    </View>
  );
}

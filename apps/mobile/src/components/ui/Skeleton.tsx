import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useThemeColors } from "../../theme/useThemeColors";

/** Nabız atan yer tutucu; ölçü ve şekil `className`'den. Yükleme her yerde bununla — spinner yok. */
export function Skeleton({ className = "" }: { className?: string }) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse, reduceMotion]);
  const overlay = useAnimatedStyle(() => ({ opacity: pulse.value * 0.5 }));
  return (
    <View className={`overflow-hidden rounded-md bg-muted ${className}`}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }, overlay]} />
    </View>
  );
}

import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { Sheen } from "../../components/ui/Sheen";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Yelpazenin tek kartı: yerine doğru yükselir (ease-out, zıplama yok); orta
 * kart ara sıra parlar. (Dönüş/ölçek animasyonu sınıfla ifade edilemez.)
 */
export function HeroCard({
  slot,
  size,
  from,
  to,
  icon: Icon,
  label,
}: {
  slot: -1 | 0 | 1;
  size: number;
  from: string;
  to: string;
  icon: LucideIcon;
  label: string;
}) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const rise = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) rise.value = withDelay(slot === 0 ? 120 : 240, withTiming(1, { duration: 640, easing: Easing.out(Easing.cubic) }));
  }, [rise, slot, reduceMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(rise.value, [0, 0.4], [0, 1], "clamp"),
    transform: [
      { translateX: interpolate(rise.value, [0, 1], [0, slot * size * 0.62]) },
      { translateY: interpolate(rise.value, [0, 1], [28, slot === 0 ? 0 : 14]) },
      { rotate: `${slot * 9 * rise.value}deg` },
      { scale: slot === 0 ? 1.06 : 0.92 },
    ],
  }));
  const radius = size * 0.16;
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size * 1.2,
          borderRadius: radius,
          shadowColor: colors.scrim,
          shadowOpacity: 0.3,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          zIndex: slot === 0 ? 2 : 1,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, borderRadius: radius, overflow: "hidden" }} className="justify-between p-4">
        <GradientFill from={from} to={to} />
        <View className="size-12 items-center justify-center rounded-2xl bg-on-image/20">
          <Icon color={colors["on-image"]} size={26} strokeWidth={2.2} />
        </View>
        <Text className="text-lg font-extrabold text-on-image">{label}</Text>
      </View>
      {slot === 0 ? <Sheen width={size} height={size * 1.2} radius={radius} delay={900} /> : null}
    </Animated.View>
  );
}

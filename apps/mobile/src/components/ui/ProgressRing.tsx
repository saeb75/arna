import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useThemeColors } from "../../theme/useThemeColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** `value` (0..1) kadar dolan halka, kendini çizerek; ortasına çocuklar oturur. */
export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  color,
  track,
  children,
  delay = 0,
  duration = 1100,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  delay?: number;
  duration?: number;
}) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const r = (size - stroke) / 2;
  const length = 2 * Math.PI * r;
  const drawn = useSharedValue(0);
  useEffect(() => {
    const to = Math.max(0, Math.min(1, value));
    drawn.value = reduceMotion
      ? to
      : withDelay(delay, withTiming(to, { duration, easing: Easing.out(Easing.cubic) }));
  }, [value, reduceMotion, drawn, delay, duration]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - drawn.value) }));
  return (
    // Ölçü prop'tan — gerekçeli inline stil
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? colors.muted} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? colors.brand}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${length} ${length}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}

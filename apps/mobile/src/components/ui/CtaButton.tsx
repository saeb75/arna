import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";
import { GradientFill } from "./GradientFill";
import { Sheen } from "./Sheen";

const HEIGHT = 58;
const RADIUS = 18;

/**
 * Sayfanın TEK ana eylemi: marka gradyanı + ara sıra geçen ışık. `breathe`:
 * gözü çeken yavaş, minik bir şişme (paywall, plan). `busy`: dönen gösterge,
 * dokunuş yok; `disabled`: soluk, dokunuş yok. Her basışta hafif dokunsal darbe.
 */
export function CtaButton({
  label,
  onPress,
  busy = false,
  disabled = false,
  breathe = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  breathe?: boolean;
  icon?: ReactNode;
}) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const swell = useSharedValue(1);
  useEffect(() => {
    if (!breathe || reduceMotion) return;
    swell.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(1.015, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [breathe, reduceMotion, swell]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: swell.value }] }));
  return (
    <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy, disabled }}
        onPress={() => {
          HapticsService.tap();
          onPress();
        }}
        disabled={busy || disabled}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        className={`flex-row items-center justify-center gap-2 overflow-hidden active:opacity-90 ${disabled ? "opacity-50" : ""}`}
        // Sabit ölçü + köşe: Sheen aynı değerlerle kırpıyor, tek kaynak burada
        style={{ height: HEIGHT, borderRadius: RADIUS }}
      >
        <GradientFill />
        {!disabled && width > 0 ? <Sheen width={width} height={HEIGHT} radius={RADIUS} delay={1400} /> : null}
        {busy ? (
          <ActivityIndicator color={colors["on-brand"]} />
        ) : (
          <>
            {icon}
            <Text className="text-lg font-bold text-on-brand">{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

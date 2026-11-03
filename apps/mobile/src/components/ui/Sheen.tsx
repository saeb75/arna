import { useEffect, useId } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Ara sıra üzerinden geçen ışık bandı — ana eylem ve öne çıkan kartlar için.
 * 1100 ms geçiş, 1600 ms ara; Hareketi Azalt açıkken hiç çizilmez.
 * (Animasyonlu ölçü/dönüş sınıfla ifade edilemez — gerekçeli inline stil.)
 */
export function Sheen({
  width,
  height,
  radius = 18,
  delay = 900,
}: {
  width: number;
  height: number;
  radius?: number;
  delay?: number;
}) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const id = `sheen${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const pass = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    pass.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withDelay(1600, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );
  }, [pass, delay, reduceMotion]);
  const band = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(pass.value, [0, 1], [-width * 1.2, width * 1.2]) },
      { rotate: "18deg" },
    ],
  }));
  if (reduceMotion || width <= 0) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden", borderRadius: radius }]} pointerEvents="none">
      <Animated.View
        style={[{ position: "absolute", top: -height * 0.2, left: width * 0.2, width: width * 0.5, height: height * 1.4 }, band]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors["on-image"]} stopOpacity={0} />
              <Stop offset="0.5" stopColor={colors["on-image"]} stopOpacity={0.4} />
              <Stop offset="1" stopColor={colors["on-image"]} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </Animated.View>
    </View>
  );
}

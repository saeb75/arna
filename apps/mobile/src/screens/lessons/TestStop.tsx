import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Check, Trophy } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { ROAD_R, type NodeRect, type PathStop } from "../../lib/lessonPath";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";
import { usePressDip } from "./usePressDip";

/**
 * Ünite testi: yolun en belirgin durağı — büyük altın düğüm, kupa, iki satır
 * etiket. Dersler bitince (`ready`) halka nefes alır. Test kapı değil aynadır:
 * her durumda dokunulabilir.
 */
export function TestStop({
  stop,
  x,
  onPress,
}: {
  stop: Extract<PathStop, { kind: "test" }>;
  x: number;
  onPress: (stop: PathStop, rect: NodeRect) => void;
}) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const ref = useRef<View>(null);
  const ring = 128;
  const face = 100;
  const lip = 8;
  const press = usePressDip(lip);
  const ready = stop.state === "ready";
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!ready || reduceMotion) return;
    breathe.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [ready, reduceMotion, breathe]);

  const halo = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breathe.value * 0.08 }], opacity: 1 - breathe.value * 0.35 }));
  const labelWidth = 240;

  return (
    <View className="absolute items-center" style={{ left: x - labelWidth / 2, top: ROAD_R - ring / 2, width: labelWidth }}>
      <View style={{ width: ring, height: ring }}>
        <Animated.View className="absolute inset-0 rounded-full bg-test-halo" style={halo} />
        <Pressable
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={tr.home.unitTest(stop.unitIndex)}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          onPress={() => {
            HapticsService.tap();
            ref.current?.measureInWindow((rx, ry, w, h) => onPress(stop, { x: rx, y: ry, width: w, height: h }));
          }}
          className="absolute inset-0 items-center justify-center"
        >
          <View style={{ width: face, height: face + lip, marginTop: -lip }}>
            <View className="absolute rounded-full bg-test-lip" style={{ top: lip, width: face, height: face }} />
            <Animated.View className="items-center justify-center rounded-full bg-test-face" style={[{ width: face, height: face }, press.style]}>
              <Trophy color={colors["test-icon"]} size={44} strokeWidth={2.2} />
            </Animated.View>
          </View>
          {stop.state === "completed" ? (
            <View className="absolute right-2 top-2 size-7 items-center justify-center rounded-full bg-card shadow-sm shadow-scrim/20">
              <Check color={colors["test-ink"]} size={16} strokeWidth={3.6} />
            </View>
          ) : null}
        </Pressable>
      </View>
      <Text className="mt-2 text-base font-extrabold text-foreground">{tr.home.unitTest(stop.unitIndex)}</Text>
      <Text className={`text-[13px] font-semibold ${ready ? "text-test-ink" : "text-muted-foreground"}`}>
        {ready ? tr.home.testReady : tr.home.testSub}
      </Text>
    </View>
  );
}

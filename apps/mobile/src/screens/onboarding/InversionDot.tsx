import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { interpolate, interpolateColor, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { ArrowRight } from "lucide-react-native";

/** Noktanın çapı */
export const DOT = 76;
/** Özgün geometri 667 pt ekran için yapılmıştı — ekranla ölçeklenince her telefonda aynı eğriyi süpürür */
const ORIGINAL = { dot: 100, perspective: 200, grow: 6, height: 667 };

/** Yol boyunca sayfa renkleri (`colors[step]` = gösterilen sayfa; sondan sonra son renk) */
export function pageColor(colors: readonly string[], i: number): string {
  "worklet";
  return colors[i] ?? colors[colors.length - 1] ?? "#000000";
}

/**
 * NOKTA DÖNÜŞÜMÜ (GlotCast). Nokta sonraki sayfanın rengini giyer; çevirmede 3B
 * döner ve büyür — yarı yolda sayfa onun rengini alır, nokta eski sayfanın
 * renginde boyuna döner. Ok dönüşte gizlenir, asla aynalı görünmez. Hareketi
 * Azalt: renkler çapraz söner, hiçbir şey dönmez. (3B dönüşüm/ölçek animasyonu
 * sınıfla ifade edilemez — StyleSheet istisnası.)
 */
export function InversionDot({
  progress,
  step,
  colors,
  iconColor,
  reduceMotion,
  label,
  onPress,
}: {
  progress: SharedValue<number>;
  step: SharedValue<number>;
  colors: SharedValue<string[]>;
  iconColor: string;
  reduceMotion: boolean;
  label: string;
  onPress: () => void;
}) {
  const { height } = useWindowDimensions();
  const k = height / ORIGINAL.height;
  const grow = (ORIGINAL.grow * k * ORIGINAL.dot) / DOT;
  const perspective = ORIGINAL.perspective * k;

  const dot = useAnimatedStyle(() => {
    const p = progress.value;
    const i = step.value;
    const from = pageColor(colors.value, i);
    const to = pageColor(colors.value, i + 1);
    const next = pageColor(colors.value, i + 2);
    if (reduceMotion) return { backgroundColor: interpolateColor(p, [0, 1], [to, next]) };
    return {
      backgroundColor: p < 0.5 ? to : p < 0.9 ? from : interpolateColor(p, [0.9, 1], [from, next]),
      transform: [
        { perspective },
        { rotateY: `${interpolate(p, [0, 0.5, 1], [0, -90, -180])}deg` },
        { scale: interpolate(p, [0, 0.5, 1], [1, grow, 1]) },
        { translateX: interpolate(p, [0, 0.5, 1], [0, DOT / 2, 0]) },
      ],
    };
  });

  const arrow = useAnimatedStyle(() => {
    const p = progress.value;
    const shown = interpolate(p, [0, 0.05, 0.9, 1], [1, 0, 0, 1], "clamp");
    if (reduceMotion) return { opacity: shown };
    return { opacity: shown, transform: [{ rotateY: `${interpolate(p, [0, 0.5, 1], [0, 180, 180])}deg` }, { scale: shown }] };
  });

  return (
    // Kendi gerçek katmanı (asla düzleştirilmez): iOS dönen noktayı o düzlemde çizer
    <Animated.View collapsable={false} style={[styles.dot, dot]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={14} style={styles.hit}>
        <Animated.View style={arrow}>
          <ArrowRight color={iconColor} size={30} strokeWidth={2.4} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  hit: { flex: 1, alignItems: "center", justifyContent: "center" },
});

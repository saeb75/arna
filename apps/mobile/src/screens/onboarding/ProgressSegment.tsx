import { Platform, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { withAlpha } from "../../../colors";

/** Android ölçekleyerek doldurur (her karede yerleşim yok — sayfa çevrilirken kare düşürüyordu) */
const SCALE_FILL = Platform.OS === "android";

/** Tek parça — 420 ms dolar. Renk sayfanın mürekkebinden (açık/marka sayfada farklı). */
export function ProgressSegment({ on, color }: { on: boolean; color: string }) {
  const fill = useAnimatedStyle(() =>
    SCALE_FILL
      ? { width: "100%", transformOrigin: "left center", transform: [{ scaleX: withTiming(on ? 1 : 0, { duration: 420 }) }] }
      : { width: withTiming(on ? "100%" : "0%", { duration: 420 }) },
  );
  return (
    // Mürekkep rengi sayfa tonuna göre ÇALIŞMA ZAMANINDA seçilir — gerekçeli inline stil
    <View className="h-1 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: withAlpha(color, 0.2) }}>
      <Animated.View className="h-full rounded-full" style={[{ backgroundColor: color }, fill]} />
    </View>
  );
}

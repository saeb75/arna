import { Image } from "expo-image";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

/**
 * Ağız atlasından TEK kare — SpriteAvatar'ın ağız yığınındaki bir katman.
 * Kırpma kutusu karenin ölçüsündedir; içindeki atlas görseli seçili karenin
 * sütun/satırına kaydırılır (sprite-sheet). Kare ve opaklık her karede değişebilir
 * — React render'ı tetiklemeden, yalnız paylaşımlı değerlerle (UI thread).
 */
export function SpriteTile({
  source,
  tileW,
  tileH,
  atlasW,
  atlasH,
  col,
  row,
  opacity,
}: {
  source: number;
  tileW: number;
  tileH: number;
  atlasW: number;
  atlasH: number;
  col: SharedValue<number>;
  row: SharedValue<number>;
  opacity: SharedValue<number>;
}) {
  const clip = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheet = useAnimatedStyle(() => ({
    transform: [{ translateX: -col.value * tileW }, { translateY: -row.value * tileH }],
  }));
  return (
    // Ölçü atlas/rig verisinden gelen ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <Animated.View className="absolute left-0 top-0 overflow-hidden" style={[{ width: tileW, height: tileH }, clip]}>
      <Animated.View style={[{ width: atlasW, height: atlasH }, sheet]}>
        <Image source={source} style={{ width: atlasW, height: atlasH }} contentFit="fill" cachePolicy="memory" transition={0} />
      </Animated.View>
    </Animated.View>
  );
}

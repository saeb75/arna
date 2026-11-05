import { Image } from "expo-image";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

/**
 * Kayan iris — SpriteAvatar göz yığınının ortası. Açıklık dışına taşan kısmını
 * üstteki göz çerçevesi örter (çerçeve görseli açıklığı oyulmuş portredir —
 * scripts/sprite-avatars/build.py), bu yüzden burada maske yoktur.
 */
export function SpriteIris({
  source,
  rect,
  gazeX,
  gazeY,
}: {
  source: number;
  /** [x, y, w, h] tuval pikseli */
  rect: number[];
  gazeX: SharedValue<number>;
  gazeY: SharedValue<number>;
}) {
  const [x, y, w, h] = rect as [number, number, number, number];
  const move = useAnimatedStyle(() => ({ transform: [{ translateX: gazeX.value }, { translateY: gazeY.value }] }));
  return (
    // Konum/ölçü rig verisinden gelen ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <Animated.View className="absolute" style={[{ left: x, top: y, width: w, height: h }, move]}>
      <Image source={source} style={{ width: w, height: h }} contentFit="fill" cachePolicy="memory" transition={0} />
    </Animated.View>
  );
}

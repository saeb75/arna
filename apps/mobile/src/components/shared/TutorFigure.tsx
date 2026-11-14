import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Image } from "expo-image";
import { GradientFill } from "../ui/GradientFill";

/** Süs küreleri — konum/boy kutuya göre (sabit tasarım değerleri) */
const ORBS = [
  { left: 0, top: 26, size: 8 },
  { left: 136, top: 8, size: 10 },
  { left: 140, top: 106, size: 12 },
  { left: 8, top: 126, size: 7 },
];

/**
 * Başlık kartının sağındaki öğretmen (yolculuk, rol yap) — referanstaki arının yerinde
 * öğrencinin KENDİ öğretmeni. `hero` varsa (şeffaf zeminli, kulaklıklı 3B figür — domain/tutorHero)
 * yumuşak marka ışığı önünde yavaşça süzülür; yoksa 2.5D portre yuvarlak çerçevede.
 * Etrafta küçük gradyan küreler. Yalnız süs; dokunuş yok. Hareket "azalt" ayarına uyar.
 */
export function TutorFigure({ hero, portrait }: { hero: number | null; portrait: number | null }) {
  const reduceMotion = useReducedMotion();
  const float = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduceMotion, float]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * float.value }] }));

  return (
    // Sabit tasarım ölçüleri — gerekçeli inline stil (kutu 150×150)
    <View pointerEvents="none" style={{ width: 150, height: 150 }}>
      <View className="absolute rounded-full bg-brand/10" style={{ left: 10, top: 10, width: 130, height: 130 }} />
      {hero !== null ? (
        <Animated.View className="absolute" style={[{ left: 0, top: -2, width: 150, height: 150 }, bob]}>
          {/* expo-image NativeWind sınıfı almaz — ölçü style ile */}
          <Image source={hero} contentFit="contain" transition={0} accessibilityIgnoresInvertColors style={{ width: "100%", height: "100%" }} />
        </Animated.View>
      ) : (
        <View
          className="absolute overflow-hidden rounded-full border-4 border-card bg-muted shadow-lg shadow-scrim/20"
          style={{ left: 22, top: 22, width: 106, height: 106 }}
        >
          {portrait !== null ? (
            <Image source={portrait} contentFit="cover" contentPosition="top" transition={0} accessibilityIgnoresInvertColors style={{ width: "100%", height: "100%" }} />
          ) : null}
        </View>
      )}
      {ORBS.map((o, i) => (
        <View
          key={i}
          className="absolute overflow-hidden rounded-full shadow-sm shadow-scrim/20"
          style={{ left: o.left, top: o.top, width: o.size, height: o.size }}
        >
          <GradientFill vertical />
        </View>
      ))}
    </View>
  );
}

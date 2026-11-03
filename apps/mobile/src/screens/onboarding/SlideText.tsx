import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { INTRO_LAYOUT_ANIMATIONS } from "./introMotion";

/**
 * Sayfanın vaadi: başlık KELİME KELİME (60 ms arayla, ease-out, zıplama yok),
 * sonra altındaki satır. Android'de ikisi birlikte, sayfayla belirir.
 * Renkler sayfa tonuna göre çağırandan (marka sayfasında açık mürekkep).
 */
export function SlideText({ title, body, color, muted, delay = 380 }: { title: string; body: string; color: string; muted: string; delay?: number }) {
  if (!INTRO_LAYOUT_ANIMATIONS) {
    return (
      <View className="gap-3">
        <Text accessibilityRole="header" className="text-4xl font-extrabold leading-tight tracking-tight" style={{ color }}>
          {title}
        </Text>
        <Text className="text-lg leading-snug" style={{ color: muted }}>
          {body}
        </Text>
      </View>
    );
  }
  const words = title.split(/(?<= )/).filter(Boolean);
  return (
    <View className="gap-3">
      <View accessible accessibilityRole="header" accessibilityLabel={title} className="flex-row flex-wrap">
        {words.map((word, i) => (
          <Animated.Text
            key={`${word}${i}`}
            entering={FadeInDown.delay(delay + i * 60).duration(460).easing(Easing.out(Easing.cubic))}
            className="text-4xl font-extrabold leading-tight tracking-tight"
            style={{ color }}
          >
            {word}
          </Animated.Text>
        ))}
      </View>
      <Animated.View entering={FadeInDown.delay(delay + words.length * 60 + 80).duration(420).easing(Easing.out(Easing.cubic))}>
        <Text className="text-lg leading-snug" style={{ color: muted }}>
          {body}
        </Text>
      </Animated.View>
    </View>
  );
}

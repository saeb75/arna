import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

/**
 * Avatar gelene kadar (WebView dilimi) konuşma göstergesi: Emma konuşurken
 * nazikçe nefes alan bir halka. Reanimated'a gerek yok — RN Animated yeterli.
 */
export function SpeakingIndicator({ speaking }: { speaking: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!speaking) {
      scale.stopAnimation();
      scale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [speaking, scale]);

  return (
    <View className="items-center py-4">
      <Animated.View
        style={{ transform: [{ scale }] }}
        className={`size-16 items-center justify-center rounded-full ${
          speaking ? "bg-primary" : "bg-card"
        }`}
      >
        <Text className="text-2xl">🎧</Text>
      </Animated.View>
      <Text className="mt-2 text-xs text-muted">{speaking ? "Emma konuşuyor…" : "Emma"}</Text>
    </View>
  );
}

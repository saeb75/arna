import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

/** Yol düğümü: basınca yüz dudağın üstüne iner (`lip` kadar) */
export function usePressDip(lip: number) {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: pressed.value * lip }] }));
  return {
    style,
    onPressIn: () => {
      pressed.value = withTiming(1, { duration: 70 });
    },
    onPressOut: () => {
      pressed.value = withTiming(0, { duration: 140 });
    },
  };
}


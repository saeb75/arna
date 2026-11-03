import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Mic } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";
import { GradientFill } from "../ui/GradientFill";


/**
 * Bas-konuş mikrofonu. KÖK KURAL: basılıyken ASLA `disabled` olmaz — RN
 * `onPressOut`u düşürür ve kayıt sahipsiz kalır (mikrofon açık, cevap hiç
 * gitmez). Bu yüzden `disabled = locked && !recording`.
 */
export function MicButton({
  locked,
  recording,
  onPressIn,
  onPressOut,
  size: SIZE = 60,
}: {
  locked: boolean;
  recording: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  /** Çap — ders ekranının ana mikrofonu daha büyük */
  size?: number;
}) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (!recording || reduceMotion) {
      pulse.value = withTiming(0, { duration: 160 });
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [recording, reduceMotion, pulse]);
  // Kayıt hâlesi: ölçek + opaklık animasyonu sınıfla ifade edilemez
  const halo = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.35 }], opacity: recording ? 0.35 - pulse.value * 0.2 : 0 }));
  const disabled = locked && !recording;
  return (
    <View className="items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <Animated.View className="absolute rounded-full bg-destructive" style={[{ width: SIZE, height: SIZE }, halo]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={recording ? tr.lesson.releaseToSend : tr.lesson.holdToTalk}
        disabled={disabled}
        onPressIn={() => {
          HapticsService.tap();
          onPressIn();
        }}
        onPressOut={onPressOut}
        className={`items-center justify-center overflow-hidden rounded-full ${recording ? "bg-destructive" : disabled ? "bg-muted" : ""}`}
        style={{
          width: SIZE,
          height: SIZE,
          shadowColor: colors.brand,
          shadowOpacity: disabled || recording ? 0 : 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
        }}
      >
        {!recording && !disabled ? <GradientFill /> : null}
        <Mic color={disabled ? colors["muted-foreground"] : colors["on-brand"]} size={Math.round(SIZE * 0.43)} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

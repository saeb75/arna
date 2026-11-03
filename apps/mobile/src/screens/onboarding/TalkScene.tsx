import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOut } from "react-native-reanimated";
import { Mic } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { useLoopStep } from "./useLoopStep";

const rise = FadeInDown.duration(380).easing(Easing.out(Easing.cubic));

/** Tanıtım 1: Emma sorar, öğrenci cevaplar, Emma nazikçe düzeltir — döngüde. */
export function TalkScene() {
  const colors = useThemeColors();
  const step = useLoopStep(4, 1300);
  const s = tr.onboarding.scenes;
  return (
    <View className="gap-3 rounded-3xl border border-border bg-card p-4">
      <View className="min-h-[196px] gap-2.5">
        {step >= 0 ? (
          <Animated.View entering={rise} exiting={FadeOut.duration(200)} className="self-start rounded-3xl rounded-bl-lg bg-muted px-4 py-2.5">
            <Text className="text-[15px] font-semibold text-brand">{s.emmaAsk}</Text>
          </Animated.View>
        ) : null}
        {step >= 1 ? (
          <Animated.View entering={rise} exiting={FadeOut.duration(200)} className="self-end overflow-hidden rounded-3xl rounded-br-lg px-4 py-2.5">
            <GradientFill />
            <Text className="text-[15px] font-semibold text-on-brand">{s.youSay}</Text>
          </Animated.View>
        ) : null}
        {step >= 2 ? (
          <Animated.View entering={rise} exiting={FadeOut.duration(200)} className="max-w-[88%] self-start rounded-3xl rounded-bl-lg bg-muted px-4 py-2.5">
            <Text className="text-[15px] leading-snug text-foreground">{s.emmaFix}</Text>
          </Animated.View>
        ) : null}
      </View>
      <View className="flex-row items-center justify-center gap-2.5 pt-1">
        <View className="size-11 items-center justify-center overflow-hidden rounded-full">
          <GradientFill />
          <Mic color={colors["on-brand"]} size={20} strokeWidth={2.4} />
        </View>
        <Text className="text-sm font-semibold text-muted-foreground">{s.micHint}</Text>
      </View>
    </View>
  );
}

import { Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Check, Coffee } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { useLoopStep } from "./useLoopStep";

/** Tanıtım 2: bir sahne kartı ve hedefleri — konuşuldukça tek tek tiklenir. */
export function RoleplayScene() {
  const colors = useThemeColors();
  const s = tr.onboarding.scenes;
  const step = useLoopStep(s.rpGoals.length + 1, 1000);
  return (
    <View className="overflow-hidden rounded-3xl border border-border bg-card">
      <View className="h-24 justify-end overflow-hidden p-4">
        <GradientFill from={colors["cat-eat"]} to={colors["cat-eat-deep"]} />
        <View className="absolute -bottom-4 right-2 opacity-25">
          <Coffee color={colors["on-image"]} size={96} strokeWidth={1.6} />
        </View>
        <Text className="text-xl font-extrabold text-on-image">{s.rpTitle}</Text>
      </View>
      <View className="gap-3 p-4">
        {s.rpGoals.map((goal, i) => {
          const done = step > i;
          return (
            <View key={goal} className="flex-row items-center gap-3">
              <View className={`size-7 items-center justify-center rounded-full ${done ? "bg-positive" : "border-2 border-border"}`}>
                {done ? (
                  <Animated.View entering={ZoomIn.duration(260)}>
                    <Check color={colors["on-brand"]} size={15} strokeWidth={3.2} />
                  </Animated.View>
                ) : null}
              </View>
              <Text className={`text-base ${done ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{goal}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

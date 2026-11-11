import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Rol yapmada dersin hedef kalıpları — öğrenci ne kullanması gerektiğini HER AN
 * görür (canlı geri bildirim, 10 Kas 2026: "ne söylemem gerektiğini bilmiyordum").
 * Söylenen kalıp tiklenir; yalnız birebir kullanım görülür, ölçüm sunucudadır.
 */
export function PracticeTargets({ phrases, used }: { phrases: string[]; used: string[] }) {
  const colors = useThemeColors();
  return (
    <Animated.View entering={FadeInDown.duration(320)} className="gap-2 px-4 pb-3">
      <Text className="text-xs font-bold tracking-widest text-brand">{tr.lesson.practiceTargets.toLocaleUpperCase("tr")}</Text>
      <View className="flex-row flex-wrap gap-2">
        {phrases.map((p) => {
          const done = used.includes(p);
          return (
            <View
              key={p}
              className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${done ? "border-positive bg-positive/10" : "border-border bg-card"}`}
            >
              {done && (
                <Animated.View entering={FadeIn.duration(220)}>
                  <Check color={colors.positive} size={14} strokeWidth={3} />
                </Animated.View>
              )}
              <Text className={`text-[15px] font-semibold ${done ? "text-positive" : "text-foreground"}`}>{p}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

import { Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { CircleCheck, Info, OctagonX } from "lucide-react-native";
import type { Toast } from "../../stores/useToastStore";
import { useThemeColors } from "../../theme/useThemeColors";

const ICON = { success: CircleCheck, error: OctagonX, info: Info } as const;
const TONE = { success: "positive", error: "negative", info: "info" } as const;

/** Tek mesaj — 180 ms belirir, 160 ms söner. */
export function ToastItem({ toast }: { toast: Toast }) {
  const colors = useThemeColors();
  const Icon = ICON[toast.kind];
  return (
    <Animated.View
      entering={FadeInUp.duration(180)}
      exiting={FadeOutUp.duration(160)}
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="flex-row gap-2.5 rounded-2xl border border-border bg-popover px-4 py-3"
      style={{ shadowColor: colors.scrim, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
    >
      <View className="pt-0.5">
        <Icon color={colors[TONE[toast.kind]]} size={17} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-popover-foreground">{toast.title}</Text>
        {toast.description ? <Text className="text-sm text-muted-foreground">{toast.description}</Text> : null}
      </View>
    </Animated.View>
  );
}

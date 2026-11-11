import { Pressable, Text } from "react-native";
import { Volume2 } from "lucide-react-native";
import { tr } from "../../../i18n/tr";
import { HapticsService } from "../../../services/HapticsService";
import { useDrillHost } from "./DrillHost";
import { useThemeColors } from "../../../theme/useThemeColors";

/** Dinleme kartı — cümleyi öğretmenin sesiyle (yeniden) çalar. */
export function ListenButton({ text, large = true }: { text: string; large?: boolean }) {
  const colors = useThemeColors();
  const { play, speaking } = useDrillHost();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tr.drill.replay}
      onPress={() => {
        HapticsService.tap();
        play(text);
      }}
      className={`flex-row items-center gap-3 self-start rounded-3xl border-2 border-brand/40 bg-brand/10 active:opacity-80 ${large ? "px-6 py-5" : "px-4 py-2.5"}`}
    >
      <Volume2 color={colors.brand} size={large ? 34 : 20} strokeWidth={2.4} />
      <Text className={`font-semibold text-brand ${large ? "text-base" : "text-sm"} ${speaking ? "opacity-60" : ""}`}>
        {tr.drill.replay}
      </Text>
    </Pressable>
  );
}

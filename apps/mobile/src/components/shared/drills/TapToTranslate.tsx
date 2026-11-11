import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Languages } from "lucide-react-native";
import { tr } from "../../../i18n/tr";
import { useDrillHost } from "./DrillHost";
import { useThemeColors } from "../../../theme/useThemeColors";

/**
 * Dokun-çevir — İngilizce metnin ana dildeki anlamı. Çeviri sunucuda kalıcı
 * önbellekte (her cümle bir kez çevrilir); ikinci dokunuş kapatır.
 */
export function TapToTranslate({ text }: { text: string }) {
  const colors = useThemeColors();
  const { translate, translation } = useDrillHost();
  if (!translate) return null; // testte ipucu yok
  const open = translation?.source === text;
  return (
    <View className="gap-1.5">
      <Pressable
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => translate(text)}
        className="flex-row items-center gap-1.5 self-start rounded-full bg-muted px-3 py-1.5 active:opacity-70"
      >
        <Languages color={colors["muted-foreground"]} size={14} />
        <Text className="text-xs font-semibold text-muted-foreground">{tr.drill.tapToTranslate}</Text>
      </Pressable>
      {open && (
        <Animated.Text entering={FadeIn.duration(200)} className="text-[15px] leading-5 text-muted-foreground">
          {translation?.text ?? "…"}
        </Animated.Text>
      )}
    </View>
  );
}

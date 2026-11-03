import { Pressable, Text, View } from "react-native";
import { ChevronRight, Crown } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Ücretsiz kullanıcının bugünkü hakkı — kalan varsa sakin bilgi, bittiyse
 * "Pro'ya geç" çağrısı. Pro'da hiç çizilmez (çağıran null verir).
 */
export function QuotaBanner({ used, label, onPro }: { used: boolean; label: string; onPro: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPro}
      className={`flex-row items-center gap-3 rounded-2xl px-4 py-3 active:opacity-80 ${used ? "bg-brand/15" : "bg-muted"}`}
    >
      <View className="size-8 items-center justify-center rounded-xl bg-brand/15">
        <Crown color={colors.brand} size={16} strokeWidth={2.4} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        {used ? <Text className="text-xs text-muted-foreground">{tr.quota.resets}</Text> : null}
      </View>
      <Text className="text-sm font-bold text-brand">{tr.quota.goPro}</Text>
      <ChevronRight color={colors.brand} size={16} strokeWidth={2.4} />
    </Pressable>
  );
}

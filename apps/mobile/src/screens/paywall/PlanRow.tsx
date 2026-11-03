import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Seçilecek plan: radyo, adı ve anlamı (deneme / faturalandırma), sağda
 * faturalanan fiyat — mağazanın istediği gibi EN BÜYÜK rakam — altında
 * haftalık karşılığı. Rozet üst kenara oturur.
 */
export function PlanRow({
  title,
  note,
  price,
  sub,
  badge,
  selected,
  onPress,
}: {
  title: string;
  note: string;
  price: string;
  sub?: string | null;
  badge?: string | null;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={[title, price, note, sub].filter(Boolean).join(", ")}
      onPress={() => {
        if (!selected) HapticsService.selection();
        onPress();
      }}
      className={`flex-row items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3.5 active:opacity-90 ${selected ? "border-brand" : "border-border"}`}
    >
      {badge ? (
        <View className="absolute -top-3 right-4 overflow-hidden rounded-full px-2.5 py-0.5">
          <GradientFill />
          <Text className="text-xs font-extrabold text-on-brand">{badge}</Text>
        </View>
      ) : null}
      <View className={`size-6 items-center justify-center rounded-full border-2 ${selected ? "border-brand bg-brand" : "border-border"}`}>
        {selected ? <Check color={colors["on-brand"]} size={14} strokeWidth={3.4} /> : null}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-bold text-foreground">{title}</Text>
        <Text numberOfLines={2} className={`text-xs ${selected ? "font-semibold text-brand" : "text-muted-foreground"}`}>
          {note}
        </Text>
      </View>
      <View className="items-end">
        <Text numberOfLines={1} adjustsFontSizeToFit className="text-lg font-extrabold tabular-nums text-foreground">
          {price}
        </Text>
        {sub ? <Text className="text-xs tabular-nums text-muted-foreground">{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

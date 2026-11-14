import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { CountUp } from "../../components/ui/CountUp";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Defter'in büyük alanı (Gramer / Kelimeler): renkli zemin, ikon, ad, sayı;
 * dokununca kendi sayfası açılır. Renk çağırandan gelir (`tone` sınıfı).
 */
export function NotebookTile({
  icon,
  title,
  count,
  unit,
  tone,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  /** null = henüz yüklenmedi */
  count: number | null;
  unit: string;
  /** Zemin sınıfı — ör. "bg-info" */
  tone: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${count ?? 0} ${unit}`}
      onPress={() => {
        HapticsService.tap();
        onPress();
      }}
      className={`h-[188px] flex-1 justify-between overflow-hidden rounded-[28px] p-4 active:opacity-90 ${tone}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="size-12 items-center justify-center rounded-2xl bg-on-image/20">{icon}</View>
        <View className="size-9 items-center justify-center rounded-full bg-on-image">
          {/* Beyaz daire her temada beyaz — ok sabit koyu */}
          <ChevronRight color={colors.scrim} size={18} strokeWidth={2.6} />
        </View>
      </View>
      <View className="gap-0.5">
        <Text className="text-[19px] font-extrabold text-on-image">{title}</Text>
        <View className="flex-row items-baseline gap-1.5">
          {count === null ? (
            <Text className="text-4xl font-extrabold text-on-image/60">–</Text>
          ) : (
            <CountUp to={count} className="text-4xl font-extrabold tracking-tight text-on-image" />
          )}
          <Text className="text-sm font-semibold text-on-image-muted">{unit}</Text>
        </View>
      </View>
    </Pressable>
  );
}

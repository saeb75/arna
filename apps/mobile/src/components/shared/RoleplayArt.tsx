import { View } from "react-native";
import type { ThemeColors } from "../../theme/useThemeColors";
import { useThemeColors } from "../../theme/useThemeColors";
import { categoryLook } from "../../domain/roleplayCategories";
import { GradientFill } from "../ui/GradientFill";

/**
 * Senaryonun kapağı: kategori gradyanı + köşeye taşan büyük, yarı saydam ikon.
 * Ebeveynini doldurur (kart, brief kahramanı); köşe yarıçapını ebeveyn kırpar.
 */
export function RoleplayArt({ category, iconSize = 120 }: { category: string; iconSize?: number }) {
  const colors = useThemeColors();
  const look = categoryLook(category);
  const Icon = look.icon;
  const c = colors as ThemeColors & Record<string, string>;
  return (
    <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
      <GradientFill from={c[look.from]} to={c[look.to]} />
      {/* Taşan ikon konumu ölçüden türer — gerekçeli inline stil */}
      <View style={{ position: "absolute", right: -iconSize * 0.18, bottom: -iconSize * 0.18, opacity: 0.22 }}>
        <Icon color={colors["on-image"]} size={iconSize} strokeWidth={1.6} />
      </View>
    </View>
  );
}

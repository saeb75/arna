import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { withAlpha } from "../../../colors";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";
import { GLASS, GlassFill } from "./GlassFill";

/**
 * Tek cevap kartı: ikon karosu, başlık + alt satır, sağda radyo/onay kutusu.
 * Seçilince marka çerçevesi ve tonu. Onboarding, ayar sheet'leri ve ders içi
 * çoktan seçmeli şıkların ortak dili. `glass`: iOS 26'da Liquid Glass zemin (onboarding — ana
 * sayfanın cam kartlarıyla aynı dil); cam yoksa ya da değerlendirme tonu varsa dolu kart.
 */
export function OptionCard({
  title,
  subtitle,
  icon,
  selected,
  onPress,
  trailing,
  multi = false,
  disabled = false,
  tone,
  glass = false,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  selected: boolean;
  onPress: () => void;
  trailing?: ReactNode;
  /** Onay kutusu (çoklu seçim) — radyo yerine */
  multi?: boolean;
  disabled?: boolean;
  /** Değerlendirme sonrası renk (test): doğru/yanlış */
  tone?: "positive" | "negative";
  glass?: boolean;
}) {
  const colors = useThemeColors();
  const onGlass = glass && GLASS && !tone;
  const frame = onGlass
    ? selected
      ? "border-brand"
      : "border-transparent"
    : tone === "positive"
      ? "border-positive bg-positive/10"
      : tone === "negative"
        ? "border-negative bg-negative/10"
        : selected
          ? "border-brand bg-brand/10"
          : "border-border bg-card";
  const mark =
    tone === "positive" ? "border-positive bg-positive" : tone === "negative" ? "border-negative bg-negative" : selected ? "border-brand bg-brand" : "border-border";
  return (
    <Pressable
      accessibilityRole={multi ? "checkbox" : "radio"}
      accessibilityState={multi ? { checked: selected, disabled } : { selected, disabled }}
      disabled={disabled}
      onPress={() => {
        HapticsService.tap();
        onPress();
      }}
      className={`flex-row items-center gap-3.5 rounded-2xl border-2 px-4 py-3.5 active:opacity-80 ${frame}`}
    >
      {onGlass ? <GlassFill radius={16} interactive tint={selected ? withAlpha(colors.brand, 0.16) : undefined} /> : null}
      {icon ? <View className={`size-11 items-center justify-center rounded-xl ${onGlass ? "bg-brand/10" : "bg-muted"}`}>{icon}</View> : null}
      <View className="flex-1 gap-0.5">
        <Text className="text-[17px] font-semibold text-foreground">{title}</Text>
        {subtitle ? <Text className="text-sm leading-snug text-muted-foreground">{subtitle}</Text> : null}
      </View>
      {trailing}
      <View className={`size-6 items-center justify-center border-2 ${multi ? "rounded-md" : "rounded-full"} ${mark}`}>
        {selected || tone ? <Check color={colors["on-brand"]} size={14} strokeWidth={3.2} /> : null}
      </View>
    </Pressable>
  );
}

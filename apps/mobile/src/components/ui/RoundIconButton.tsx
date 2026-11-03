import type { ReactNode } from "react";
import { Pressable } from "react-native";

const BOX = {
  /** Sayfanın üst düğmeleri (geri, taç): yükseltilmiş daire */
  card: "h-12 w-12 border border-border",
  /** Araç çubuğu içinde: daha sakin çip */
  muted: "h-10 w-10",
} as const;
const FILL = { card: "bg-card", muted: "bg-muted" } as const;

/** Tek ikonlu yuvarlak düğme; `label` VoiceOver'ın okuduğu ad. */
export function RoundIconButton({
  icon,
  label,
  onPress,
  variant = "card",
  selected = false,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  variant?: keyof typeof BOX;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={4}
      className={`items-center justify-center rounded-full active:opacity-70 ${BOX[variant]} ${selected ? "bg-brand/20" : FILL[variant]}`}
    >
      {icon}
    </Pressable>
  );
}

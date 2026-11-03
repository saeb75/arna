import { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Marka gradyanı (ya da verilen iki renk) — ebeveynini doldurur: CTA, rozet,
 * banner, kullanıcı balonu. Ebeveyn `overflow-hidden` + köşe yarıçapı taşır.
 */
export function GradientFill({
  from,
  to,
  vertical = false,
  opacity = 1,
}: {
  from?: string;
  to?: string;
  vertical?: boolean;
  opacity?: number;
}) {
  const colors = useThemeColors();
  const id = `grad${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2={vertical ? "0" : "1"} y2="1">
          <Stop offset="0" stopColor={from ?? colors["brand-from"]} stopOpacity={opacity} />
          <Stop offset="1" stopColor={to ?? colors["brand-to"]} stopOpacity={opacity} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

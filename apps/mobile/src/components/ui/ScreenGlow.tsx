import { useId } from "react";
import { View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useThemeColors } from "../../theme/useThemeColors";

/** Sayfanın üstündeki marka ışığı (`glow`), aşağı doğru söner; içeriğin ARKASINDA durur. */
export function ScreenGlow({ height = 380 }: { height?: number }) {
  const colors = useThemeColors();
  const id = `glow${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    // Yükseklik prop'tan gelen ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View pointerEvents="none" className="absolute inset-x-0 top-0" style={{ height }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="0%" rx="85%" ry="100%" fx="50%" fy="0%">
            <Stop offset="0" stopColor={colors.glow} stopOpacity={1} />
            <Stop offset="0.55" stopColor={colors.glow} stopOpacity={0.45} />
            <Stop offset="1" stopColor={colors.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

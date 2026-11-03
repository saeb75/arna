import { useMemo } from "react";
import { themeColors } from "../../colors";
import { useScheme } from "./useScheme";

export type ThemeColors = ReturnType<typeof themeColors>;

/** Sınıf alamayan prop'lar için ham renkler (ikon, SVG, gölge, native görünüm). */
export function useThemeColors(): ThemeColors {
  const scheme = useScheme();
  return useMemo(() => themeColors(scheme), [scheme]);
}

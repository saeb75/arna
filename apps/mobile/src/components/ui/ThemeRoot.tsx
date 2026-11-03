import { useEffect, useMemo, type ReactNode } from "react";
import { View } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useColorScheme as useNativewindScheme, vars } from "nativewind";
import { cssVariables, themeColors } from "../../../colors";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useScheme } from "../../theme/useScheme";

/**
 * TEMANIN KÖKÜ — altındaki her şey için CSS renk değişkenleri (Tailwind
 * sınıfları), navigasyon renkleri ve durum çubuğu. Tema geçişi TEK noktada:
 * `vars()` değişince bütün sınıflar aynı karede yeniden boyanır.
 */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const scheme = useScheme();
  const setting = useSettingsStore((s) => s.scheme);
  const { setColorScheme } = useNativewindScheme();
  const colors = useMemo(() => themeColors(scheme), [scheme]);
  const variables = useMemo(() => vars(cssVariables(scheme)), [scheme]);

  useEffect(() => {
    // "system" telefonu izlemeye devam eder (sabit değer kilitlerdi)
    setColorScheme(setting);
  }, [setting, setColorScheme]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.canvas);
    // Bildirimsel StatusBar'ın yanında EMPERATİF de: donmuş (freeze) bir ekranda
    // kalan eski StatusBar girdisi tema değişimini ezmesin (simülatörde ölçüldü).
    StatusBar.setStyle(scheme === "dark" ? "light" : "dark", true);
  }, [colors.canvas, scheme]);

  const navigation = useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.canvas,
        card: colors.background,
        text: colors.foreground,
        border: colors.border,
        notification: colors.destructive,
      },
    };
  }, [scheme, colors]);

  return (
    // CSS değişkenleri NativeWind `vars()` ile STİL olarak verilir — sınıfla ifade edilemez
    <View className="flex-1 bg-canvas" style={variables}>
      <ThemeProvider value={navigation}>{children}</ThemeProvider>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </View>
  );
}

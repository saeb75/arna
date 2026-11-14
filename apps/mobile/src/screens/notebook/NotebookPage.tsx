import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopBar } from "../../components/ui/TopBar";

/** Defter'in alt sayfası: geri düğmesi + büyük başlık, altında liste. */
export function NotebookPage({ title, children }: { title: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    // Üst güvenli alan + yüzen üst bar ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 64 }}>
      <Text accessibilityRole="header" className="px-4 pb-3 text-3xl font-extrabold tracking-tight text-foreground">
        {title}
      </Text>
      {children}
      <TopBar />
    </View>
  );
}

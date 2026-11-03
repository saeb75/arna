import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "../../stores/useToastStore";
import { ToastItem } from "./ToastItem";

/** Üst ortada, her ekranın üstünde kısa mesajlar. Dokunuşlar içinden geçer. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((s) => s.toasts);
  return (
    // Üst güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View pointerEvents="none" className="absolute inset-x-0 top-0 gap-2 px-4" style={{ paddingTop: insets.top + 8 }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  );
}

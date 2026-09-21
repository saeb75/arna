import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UpdatesController } from "../../controllers/UpdatesController";
import { useUpdatesStore } from "../../stores/useUpdatesStore";

/**
 * İnen güncelleme hazır olduğunda üstte beliren yüzen kart. Üç sekmeye birden
 * hizmet ettiği için `shared/`; konumlandırmayı TabBar gibi KENDİ taşır, böylece
 * layout dosyasında stil olmaz (CLAUDE.md ince rota kuralı).
 */
export function UpdateBanner() {
  const insets = useSafeAreaInsets();
  const pending = useUpdatesStore((s) => s.pending);
  const applying = useUpdatesStore((s) => s.applying);

  if (!pending) return null;

  return (
    <View
      className="absolute inset-x-0 items-center px-4"
      // Üst güvenli alan ÇALIŞMA ZAMANI değeri — NativeWind sınıfıyla ifade edilemez.
      style={{ top: insets.top + 8 }}
    >
      <View className="w-full flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-3">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">Yeni sürüm hazır</Text>
          <Text className="text-xs text-muted">Uygulamayı yeniden başlatınca uygulanacak.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={applying}
          onPress={() => void UpdatesController.apply()}
          className={`rounded-full bg-primary/20 px-4 py-2 ${applying ? "opacity-40" : "active:opacity-80"}`}
        >
          {applying ? (
            <ActivityIndicator color="#8b5cf6" />
          ) : (
            <Text className="text-sm font-semibold text-primary">Yeniden başlat</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

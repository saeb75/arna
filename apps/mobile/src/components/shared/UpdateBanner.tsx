import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { UpdatesController } from "../../controllers/UpdatesController";
import { useUpdatesStore } from "../../stores/useUpdatesStore";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * İnen güncelleme hazır olunca üstte beliren kart. Yalnız sekme kabuğunda
 * çizilir — ders/test ortasında yeniden başlatma ilerlemeyi keserdi.
 */
export function UpdateBanner() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const pending = useUpdatesStore((s) => s.pending);
  const applying = useUpdatesStore((s) => s.applying);
  if (!pending) return null;
  return (
    // Üst güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <Animated.View entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)} className="absolute inset-x-0 items-center px-4" style={{ top: insets.top + 8 }}>
      <View className="w-full flex-row items-center gap-3 rounded-2xl border border-border bg-popover px-4 py-3">
        <View className="size-9 items-center justify-center rounded-xl bg-brand/15">
          <Sparkles color={colors.brand} size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{tr.updates.title}</Text>
          <Text className="text-xs text-muted-foreground">{tr.updates.body}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={applying}
          onPress={() => void UpdatesController.apply()}
          className={`rounded-full bg-primary px-4 py-2 ${applying ? "opacity-50" : "active:opacity-80"}`}
        >
          {applying ? (
            <ActivityIndicator color={colors["primary-foreground"]} />
          ) : (
            <Text className="text-sm font-bold text-primary-foreground">{tr.updates.restart}</Text>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

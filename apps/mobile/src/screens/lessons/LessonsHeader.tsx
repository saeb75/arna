import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Üst pil satırı: hedef dil + günlük seri.
 *
 * Hedef dil SABİTTİR (İngilizce) — pil bir seçici değil, bir kimlik rozetidir.
 * Bayrak için ikon setinde glif yok; emoji dairenin içinde kırpılıyor.
 *
 * Seri henüz backend'de yok (gamification tablosu Faz 2) — `streak` prop'u
 * şimdilik 0 geliyor. Uç geldiğinde yalnız çağıran değişir, bu bileşen değil.
 */
export function LessonsHeader({ streak }: { streak: number }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2 rounded-full bg-surface py-1.5 pl-1.5 pr-4">
        <View className="size-9 items-center justify-center overflow-hidden rounded-full bg-background">
          <Text className="text-xl">🇬🇧</Text>
        </View>
        <Text className="text-base font-semibold text-white">English</Text>
      </View>

      <View className="flex-row items-center gap-1.5 rounded-full bg-surface px-4 py-2.5">
        <MaterialCommunityIcons name="fire" size={20} color="#9ca3af" />
        <Text className="text-base font-semibold text-white">{streak}</Text>
      </View>
    </View>
  );
}

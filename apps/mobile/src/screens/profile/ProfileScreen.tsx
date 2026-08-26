import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthController } from "../../controllers/AuthController";

/**
 * Şimdilik tek içerik çıkış. Ders listesinin başlığında duruyordu; yeni
 * tasarımda orada yer yok ve oturumu kapatmanın doğal yeri burası.
 */
export function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    // Güvenli alan çalışma zamanı değeri — gerekçeli inline stil (CLAUDE.md)
    <View className="flex-1 bg-background px-5" style={{ paddingTop: insets.top + 16 }}>
      <Text className="text-2xl font-bold text-white">Profil</Text>
      <Pressable
        onPress={() => void AuthController.signOut()}
        className="mt-6 rounded-2xl bg-surface px-4 py-4 active:opacity-80"
      >
        <Text className="text-base font-medium text-white">Çıkış</Text>
      </Pressable>
    </View>
  );
}

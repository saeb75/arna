import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { TabBar } from "../../components/shared/TabBar";
import { UpdateBanner } from "../../components/shared/UpdateBanner";
import { useAuthStore } from "../../stores/useAuthStore";

/**
 * Sekme kabuğu. Auth kapısı ARTIK BURADA — üç rotada tekrarlanmıyor.
 * Bar tamamen `TabBar` bileşeninde; bu dosyada stil yok (CLAUDE.md ince rota kuralı).
 * `expo-router` kökündeki `Tabs` SDK 57'de deprecated → `expo-router/js-tabs`.
 *
 * Güncelleme kartı KASTEN burada: uygulamayı yeniden başlatmak ders veya test
 * ortasında ilerlemeyi keser, sekme kabuğu bu ekranları yapısal olarak dışarıda
 * bırakır — ek koşul mantığı gerekmez.
 */
export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  if (!session) return <Redirect href="/login" />;

  return (
    <>
      <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="lessons" />
        <Tabs.Screen name="practice" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <UpdateBanner />
    </>
  );
}

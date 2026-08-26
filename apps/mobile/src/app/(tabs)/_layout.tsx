import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { TabBar } from "../../components/shared/TabBar";
import { useAuthStore } from "../../stores/useAuthStore";

/**
 * Sekme kabuğu. Auth kapısı ARTIK BURADA — üç rotada tekrarlanmıyor.
 * Bar tamamen `TabBar` bileşeninde; bu dosyada stil yok (CLAUDE.md ince rota kuralı).
 * `expo-router` kökündeki `Tabs` SDK 57'de deprecated → `expo-router/js-tabs`.
 */
export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="lessons" />
      <Tabs.Screen name="practice" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

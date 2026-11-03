import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { FloatingTabBar } from "../../components/shared/FloatingTabBar";
import { UpdateBanner } from "../../components/shared/UpdateBanner";
import { useMeStore } from "../../stores/useMeStore";

/**
 * Sekme kabuğu — profil kapısı TEK yerde. Bar tamamen FloatingTabBar'da;
 * güncelleme kartı kasten burada (ders/test ortasında yeniden başlatma yok).
 */
export default function TabsLayout() {
  const hasProfile = useMeStore((s) => !!s.me?.profile);
  if (!hasProfile) return <Redirect href="/onboarding" />;
  return (
    <>
      <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false, animation: "shift" }}>
        <Tabs.Screen name="lessons" />
        <Tabs.Screen name="roleplay" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <UpdateBanner />
    </>
  );
}

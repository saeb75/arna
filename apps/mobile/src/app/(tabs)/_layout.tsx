import { Redirect } from "expo-router";
import { UpdateBanner } from "../../components/shared/UpdateBanner";
import { AppTabs } from "../../screens/root/AppTabs";
import { useMeStore } from "../../stores/useMeStore";

/**
 * Sekme kabuğu — profil kapısı TEK yerde. Bar NATIVE (AppTabs);
 * güncelleme kartı kasten burada (ders/test ortasında yeniden başlatma yok).
 */
export default function TabsLayout() {
  const hasProfile = useMeStore((s) => !!s.me?.profile);
  if (!hasProfile) return <Redirect href="/onboarding" />;
  return (
    <>
      <AppTabs />
      <UpdateBanner />
    </>
  );
}

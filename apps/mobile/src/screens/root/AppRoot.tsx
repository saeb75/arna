import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { ThemeRoot } from "../../components/ui/ThemeRoot";
import { ToastHost } from "../../components/shared/ToastHost";
import { AttributionController } from "../../controllers/AttributionController";
import { AuthController } from "../../controllers/AuthController";
import { UpdatesController } from "../../controllers/UpdatesController";
import { useAuthStore } from "../../stores/useAuthStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { BootError } from "./BootError";
import { RootStack } from "./RootStack";

// Açılış zinciri bitene kadar native splash ekranda kalır (AuthController.boot gizler)
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Uygulamanın kökü: tema, açılış kapısı, toast'lar. Açılış (misafir oturumu +
 * profil) bitmeden hiçbir ekran parlamaz; düşerse "tekrar dene".
 */
export function AppRoot() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const ready = useAuthStore((s) => s.ready);
  const bootError = useAuthStore((s) => s.bootError);

  useEffect(() => {
    // Önce güncelleme (splash ekranda, süre sınırlı): varsa uygulanır ve süreç yeniden
    // başlar; yoksa açılış zinciri sürer. Sonraki kontroller arka planda (kart).
    void UpdatesController.applyOnLaunch().finally(() => {
      void AuthController.boot();
      UpdatesController.start();
      // Kurulum ölçümü: oturum okununca başlar (açılışı beklemez, bekletmez)
      AttributionController.start();
    });
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <ThemeRoot>
        {bootError ? <BootError /> : ready && hydrated ? <RootStack /> : null}
        <ToastHost />
      </ThemeRoot>
    </GestureHandlerRootView>
  );
}

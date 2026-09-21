import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import colors from "../../colors";
import { AuthController } from "../controllers/AuthController";
import { UpdatesController } from "../controllers/UpdatesController";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Kök layout — TEK işi: oturumu geri yüklemek ve Stack'i kurmak.
 * Yönlendirme kararı index.tsx'te; ekranlar yönlendirme YAPMAZ (CLAUDE.md).
 */
export default function RootLayout() {
  const ready = useAuthStore((s) => s.ready);

  useEffect(() => {
    void AuthController.restore();
    // OTA kontrolü `ready` kapısının DIŞINDA: açılış güncellemeyi beklemez.
    UpdatesController.start();
  }, []);

  if (!ready) return null; // kalıcı oturum okunana kadar hiçbir ekran parlamasın

  return (
    <>
      {/* Light tema: durum çubuğu metni koyu */}
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </>
  );
}

"use client";

import { useEffect } from "react";
import { AuthController } from "@/controllers/AuthController";
import { useAuthStore } from "@/stores/useAuthStore";
import { SplashScreen } from "@/components/shared/SplashScreen";

/**
 * Kök layout'un istemci ucu: açılışta bir kez oturumu geri yükler. `ready`
 * olana kadar splash gösterir — kalıcı oturum okunmadan login ekranı parlamasın
 * (mobil `_layout.tsx`'teki `if (!ready) return null` kuralı).
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const ready = useAuthStore((s) => s.ready);

  useEffect(() => {
    void AuthController.restore();
  }, []);

  if (!ready) return <SplashScreen />;
  return <>{children}</>;
}

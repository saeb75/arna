"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Deklaratif yönlendirme — expo-router `<Redirect/>` karşılığı. Yalnız rota
 * dosyaları kullanır; ekranlar ve interceptor ASLA yönlendirmez (mobil kuralı).
 */
export function Redirect({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [href, router]);
  return null;
}

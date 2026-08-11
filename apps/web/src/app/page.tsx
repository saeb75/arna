"use client";

// Kök yönlendirici: oturum yoksa /login, program yoksa /onboarding, varsa /lessons
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        await api("/v1/programs/current");
        router.replace("/lessons");
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) router.replace("/onboarding");
      }
    })();
  }, [router]);

  return (
    <main className="flex h-dvh items-center justify-center">
      <p className="animate-pulse text-muted-foreground">Yükleniyor…</p>
    </main>
  );
}

"use client";

import { ShieldOff } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AuthController } from "@/controllers/AuthController";
import { fadeUp } from "@/lib/motion";
import { useAuthStore } from "@/stores/useAuthStore";

/** Oturum var, rol yok. Backend de 403 döner — bu ekran yalnız açık konuşur. */
export function ForbiddenScreen() {
  const email = useAuthStore((s) => s.session?.user.email);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-sm text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldOff className="size-6" />
        </span>
        <h1 className="text-lg font-semibold">Yönetici yetkisi yok</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> hesabında admin rolü tanımlı değil.
          Rol Supabase tarafında atanır; atandıktan sonra yeniden giriş yap.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => void AuthController.signOut()}>
          Çıkış yap
        </Button>
      </motion.div>
    </main>
  );
}

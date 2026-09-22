"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeUp } from "@/lib/motion";
import { LoginBrand } from "@/screens/login/LoginBrand";
import { LoginForm } from "@/screens/login/LoginForm";

/** Yönlendirme BURADA DEĞİL — `app/login/page.tsx` oturumu görünce /lessons'a atar. */
export function LoginScreen() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/6%,transparent_60%)]"
      />
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-sm">
        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="items-center text-center">
            <LoginBrand />
            <CardTitle className="mt-4 text-xl">Admin panel</CardTitle>
            <CardDescription>Sign in with your admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authorized accounts only. There is no sign-up here.
        </p>
      </motion.div>
    </main>
  );
}

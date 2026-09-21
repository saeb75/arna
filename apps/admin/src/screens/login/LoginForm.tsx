"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthController } from "@/controllers/AuthController";
import { errorLabel } from "@/lib/labels";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Form alanları ve `busy` YEREL state — sunum durumu, store kuralını bozmaz.
 * Hata store'dan okunur (controller yazar), metne burada çevrilir.
 */
export function LoginForm() {
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await AuthController.signIn(email.trim(), password);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="sen@glotmate.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key={error}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-sm text-destructive"
          >
            {errorLabel(error)}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" disabled={busy} className="mt-1 w-full">
        {busy && <Loader2 className="animate-spin" data-icon="inline-start" />}
        {busy ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
    </form>
  );
}

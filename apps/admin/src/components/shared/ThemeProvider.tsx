"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Tema durumu next-themes'te (localStorage) — store DEĞİL: alan verisi değil,
 * tarayıcı tercihi. `class` stratejisi: `<html class="dark">` → globals.css `.dark`
 * token'ları. Varsayılan sistem; geçişte animasyon kapalı (renk sıçraması olmasın).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

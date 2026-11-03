import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppBootstrap } from "@/components/shared/AppBootstrap";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GlotMate Admin",
  description: "GlotMate operator console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // next-themes `<html class>`'ı ilk boyamadan önce yazar — sunucu HTML'i ile farkı beklenen fark
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <ThemeProvider>
          <AppBootstrap>{children}</AppBootstrap>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

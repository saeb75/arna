import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppBootstrap } from "@/components/shared/AppBootstrap";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GlotMate Yönetim",
  description: "GlotMate admin paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <AppBootstrap>{children}</AppBootstrap>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

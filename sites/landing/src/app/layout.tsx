import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealObserver } from "@/components/reveal-observer";
import { siteConfig } from "@/lib/site";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const title = `${siteConfig.brand}: Learn English by speaking`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: title,
    template: `%s · ${siteConfig.brand}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brand,
  authors: [{ name: siteConfig.copyrightHolder }],
  creator: siteConfig.copyrightHolder,
  keywords: ["learn English", "English speaking", "AI English tutor", "English conversation", "ESL", "GlotMate"],
  openGraph: {
    type: "website",
    title,
    description: siteConfig.description,
    siteName: siteConfig.brand,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#140e0b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}

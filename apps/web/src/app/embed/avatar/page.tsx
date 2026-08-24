// Mobil WebView'ın yüklediği avatar sayfası — ince rota, iş mantığı AvatarEmbed'de.
// Auth yok ama sır da yok: sayfa yalnız kendisine push edilen klipleri çalar.
"use client";

import dynamic from "next/dynamic";

const AvatarEmbed = dynamic(() => import("@/components/AvatarEmbed"), { ssr: false });

export default function AvatarEmbedPage() {
  return <AvatarEmbed />;
}

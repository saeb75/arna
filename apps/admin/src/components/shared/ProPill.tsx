import { Crown } from "lucide-react";
import { StatusPill } from "@/components/shared/StatusPill";
import { PRO_SOURCE_LABEL } from "@/lib/labels";

/**
 * Abonelik hapı — liste satırı ve detay başlığı aynı dili konuşur. Pro tek vurgu
 * (taç ikonu), kaynağı ipucu metninde; ücretsiz = sade gri metin (renk yok).
 */
export function ProPill({ isPro, source }: { isPro: boolean; source: "revenuecat" | "admin" | null }) {
  if (!isPro) return <span className="text-xs text-muted-foreground">Free</span>;
  return (
    <StatusPill tone="accent" icon={<Crown />} title={source ? PRO_SOURCE_LABEL[source] : undefined}>
      Pro{source === "admin" && <span className="font-normal opacity-80">· admin</span>}
    </StatusPill>
  );
}

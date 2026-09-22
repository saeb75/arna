"use client";

import type { AdminLayer, LayerStatus } from "@glotmate/contracts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STATUS_LABEL, formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";

/**
 * Renk ilkesi (CLAUDE.md): tek vurgu MAVİ = yayında; gri = ara durumlar;
 * kırmızı yalnız başarısız. Yeni durum rengi eklenmez.
 */
const TONE: Record<LayerStatus, string> = {
  published: "bg-primary/10 text-primary",
  ready: "bg-muted text-foreground",
  generating: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
  retired: "text-muted-foreground",
};

/** null = bu katalog sürümü için hiç üretilmemiş → sessiz tire; durum → nokta + etiket */
export function LayerStatusBadge({ layer }: { layer: AdminLayer | null }) {
  if (!layer) return <span className="text-xs text-muted-foreground/60">—</span>;

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium",
          TONE[layer.status],
        )}
      >
        <span
          className={cn("size-1.5 rounded-full bg-current", layer.status === "generating" && "animate-pulse")}
        />
        {STATUS_LABEL[layer.status]}
      </TooltipTrigger>
      <TooltipContent>{formatDateTime(layer.updatedAt)}</TooltipContent>
    </Tooltip>
  );
}

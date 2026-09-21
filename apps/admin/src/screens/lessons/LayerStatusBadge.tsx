"use client";

import type { AdminLayer, LayerStatus } from "@glotmate/contracts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STATUS_LABEL, formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";

const TONE: Record<LayerStatus, string> = {
  published: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  ready: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  generating: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  failed: "bg-destructive/10 text-destructive",
  retired: "bg-muted text-muted-foreground",
};

/** null = bu katalog sürümü için hiç üretilmemiş → sessiz tire; durum → renkli nokta + etiket */
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

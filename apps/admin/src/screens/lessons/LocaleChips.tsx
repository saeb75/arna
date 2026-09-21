"use client";

import type { AdminLocale } from "@glotmate/contracts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STATUS_LABEL, formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";

/** Dil kodu çipleri; bayat paket turuncu nokta, başarısız kırmızı. Boşsa sessiz metin. */
export function LocaleChips({ locales }: { locales: AdminLocale[] }) {
  if (locales.length === 0) return <span className="text-xs text-muted-foreground/60">paket yok</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {locales.map((l) => (
        <Tooltip key={l.language}>
          <TooltipTrigger
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-md border px-1.5 font-mono text-[11px] uppercase",
              l.status === "failed"
                ? "border-destructive/40 text-destructive"
                : l.stale
                  ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                  : "border-border/70 text-foreground/80",
            )}
          >
            {l.stale && <span className="size-1.5 rounded-full bg-amber-500" />}
            {l.language}
          </TooltipTrigger>
          <TooltipContent>
            {STATUS_LABEL[l.status]}
            {l.stale && " · bayat (yeniden üretilecek)"} · {formatDateTime(l.updatedAt)}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

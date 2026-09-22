"use client";

import type { AdminLocale } from "@glotmate/contracts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STATUS_LABEL, formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";

/**
 * Dil kodu çipleri. Bayatlık RENKLE değil BİÇİMLE ayrılır: kesik çerçeve + içi
 * boş halka (renk ilkesi — sarı/turuncu yok). Başarısız tek kırmızı istisna.
 */
export function LocaleChips({ locales }: { locales: AdminLocale[] }) {
  if (locales.length === 0) return <span className="text-xs text-muted-foreground/60">no packs</span>;

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
                  ? "border-dashed border-border text-muted-foreground"
                  : "border-border text-foreground/80",
            )}
          >
            {l.stale && <span className="size-1.5 rounded-full border border-current" />}
            {l.language}
          </TooltipTrigger>
          <TooltipContent>
            {STATUS_LABEL[l.status]}
            {l.stale && " · stale (will regenerate)"} · {formatDateTime(l.updatedAt)}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

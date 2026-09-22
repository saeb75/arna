"use client";

import type { AdminLocaleDetail } from "@glotmate/contracts";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, formatDateTime } from "@/lib/labels";
import { LayerStatusBadge } from "@/components/shared/LayerStatusBadge";

export function LocaleRow({
  locale,
  busy,
  disabled,
  onRefresh,
}: {
  locale: AdminLocaleDetail;
  busy: boolean;
  disabled: boolean;
  onRefresh: () => void;
}) {
  const needsWork = locale.stale || locale.status === "failed";
  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs">
      <span className="w-10 font-mono text-sm uppercase">{locale.language}</span>
      <LayerStatusBadge layer={locale} />
      {locale.stale && (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <span className="size-1.5 rounded-full border border-current" />
          stale — core/scenes changed
        </span>
      )}
      <span className="text-muted-foreground">{formatDateTime(locale.updatedAt)}</span>
      {locale.model && <span className="font-mono text-[10px] text-muted-foreground/70">{locale.model}</span>}
      {locale.report?.errors.length ? (
        <span className="truncate text-destructive" title={locale.report.errors.join("\n")}>
          {locale.report.errors[0]}
        </span>
      ) : null}
      <Button
        variant={needsWork ? "default" : "ghost"}
        size="xs"
        className="ml-auto"
        disabled={disabled}
        onClick={onRefresh}
        title={needsWork ? `Regenerate this ${STATUS_LABEL[locale.status].toLowerCase()} pack` : "Delete the current pack and regenerate"}
      >
        {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
        {needsWork ? "Regenerate" : "Refresh"}
      </Button>
    </li>
  );
}

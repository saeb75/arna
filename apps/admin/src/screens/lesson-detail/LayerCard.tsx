"use client";

import type { AdminLayer, LintReport } from "@glotmate/contracts";
import { Loader2, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/labels";
import { LayerStatusBadge } from "@/components/shared/LayerStatusBadge";
import { LintReportView } from "@/screens/lesson-detail/LintReportView";

type Layer = (AdminLayer & { model: string | null; report: LintReport | null }) | null;

/**
 * Çekirdek / sahne seti kartı: durum, model, tarih, lint raporu, Yeniden üret.
 * Yeniden üretim maliyetli ve yayını düşüren bir işlem — onay diyaloğu şart.
 */
export function LayerCard({
  title,
  description,
  layer,
  busy,
  disabled,
  onRegenerate,
}: {
  title: string;
  description: string;
  layer: Layer;
  busy: boolean;
  disabled: boolean;
  onRegenerate: () => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <LayerStatusBadge layer={layer} />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Model</dt>
        <dd className="font-mono">{layer?.model ?? "—"}</dd>
        <dt className="text-muted-foreground">Updated</dt>
        <dd>{layer ? formatDateTime(layer.updatedAt) : "—"}</dd>
      </dl>

      {layer?.report && (layer.report.errors.length > 0 || layer.report.warnings.length > 0) && (
        <LintReportView report={layer.report} compact />
      )}

      <div className="mt-auto flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="outline" size="sm" disabled={disabled}>
                {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
                {layer ? "Regenerate" : "Generate"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{layer ? "Regenerate" : "Generate"} {title.toLowerCase()}?</AlertDialogTitle>
              <AlertDialogDescription>
                Calls the strong model (10–60 s, costs money). The new content lands as <strong>ready</strong>: the
                lesson goes offline until you review and publish it again. Stale language packs bound to this layer are
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRegenerate}>Generate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}

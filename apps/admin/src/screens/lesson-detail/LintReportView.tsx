import type { LintReport } from "@glotmate/contracts";
import { cn } from "@/lib/utils";

/** Lint raporu: hatalar kırmızı (tek istisna), uyarılar gri. */
export function LintReportView({ report, compact = false }: { report: LintReport; compact?: boolean }) {
  if (report.errors.length === 0 && report.warnings.length === 0) {
    return <p className="text-xs text-muted-foreground">Lint clean.</p>;
  }
  return (
    <div className={cn("flex flex-col gap-2", compact ? "text-[11px]" : "text-xs")}>
      {report.errors.length > 0 && (
        <ul className="list-disc space-y-0.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 pl-6 text-destructive">
          {report.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
      {report.warnings.length > 0 && (
        <ul className="list-disc space-y-0.5 rounded-md border border-border/70 bg-muted/40 px-3 py-2 pl-6 text-muted-foreground">
          {report.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * Oran çubuğu (0..1) — tek vurgu rengiyle ince bar + yüzde. Pay, isabet oranı,
 * ilerleme gibi "bütünün ne kadarı" sorularında; renk anlam taşımaz, uzunluk taşır.
 */
export function RatioBar({ ratio, label, className }: { ratio: number | null; label?: string; className?: string }) {
  if (ratio === null) return <span className="text-xs text-muted-foreground/60">—</span>;
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{label ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}

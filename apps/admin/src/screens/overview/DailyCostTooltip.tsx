import type { AdminOverview } from "@glotmate/contracts";
import { formatDay, formatUsd } from "@/lib/labels";

/**
 * Grafik ipucu — çubuğun hemen üstünde; kenara yakın günlerde içeri hizalanır ki
 * kartın dışına taşmasın. Biçim `TooltipContent` ile aynı (ters renk), metin token'ı.
 */
export function DailyCostTooltip({
  day,
  centerFraction,
  barPercent,
}: {
  day: AdminOverview["cost"]["byDay"][number];
  centerFraction: number;
  barPercent: number;
}) {
  const shift = centerFraction < 0.15 ? "0%" : centerFraction > 0.85 ? "-100%" : "-50%";
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-md bg-foreground px-2.5 py-1.5 text-xs whitespace-nowrap text-background shadow-md"
      style={{ left: `${centerFraction * 100}%`, bottom: `calc(${barPercent}% + 8px)`, transform: `translateX(${shift})` }}
    >
      <p className="font-medium">{formatDay(day.date, true)}</p>
      <p className="tabular-nums opacity-80">
        {formatUsd(day.usd)} · {day.calls} call{day.calls === 1 ? "" : "s"}
      </p>
    </div>
  );
}

"use client";

import type { AdminOverview } from "@glotmate/contracts";
import { useMemo, useState } from "react";
import { axisTicks, barPercent, niceCeil } from "@/lib/chart";
import { formatDay, formatUsd } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { DailyCostTooltip } from "@/screens/overview/DailyCostTooltip";

type Day = AdminOverview["cost"]["byDay"][number];

/**
 * Günlük maliyet — el yapımı tek seri çubuk grafik (kütüphane yok). Tek seri olduğu
 * için lejant yok, başlık seriyi adlandırır; renk tek vurgu (`brand`, ember). Çubuklar
 * tabana oturur, üstü hafif yuvarlak, aralarında 2px boşluk; ızgara kesik ve geri planda.
 * Üzerine gelinen günün tüm sütunu isabet alanıdır (ince çubuğu nişanlamak gerekmez).
 * Hover durumu yerel state — sunum, alan verisi değil.
 */
export function DailyCostChart({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const { max, total, peak } = useMemo(() => {
    let total = 0;
    let peak: Day | null = null;
    for (const d of days) {
      total += d.usd;
      if (!peak || d.usd > peak.usd) peak = d;
    }
    return { max: niceCeil(peak?.usd ?? 0), total, peak };
  }, [days]);
  const ticks = axisTicks(days.length);
  const hovered = hover !== null ? days[hover] : undefined;

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Daily LLM cost</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">UTC days · hover a day for calls and cost</p>
        </div>
        {peak && max > 0 && (
          <p className="text-xs tabular-nums text-muted-foreground">
            Total <span className="font-medium text-foreground">{formatUsd(total)}</span> · peak {formatUsd(peak.usd)} on{" "}
            {formatDay(peak.date)}
          </p>
        )}
      </header>

      {max === 0 ? (
        <p className="py-14 text-center text-sm text-muted-foreground">No LLM calls in this range.</p>
      ) : (
        <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
          <div className="relative h-44 min-w-12 text-right text-[10px] tabular-nums text-muted-foreground" aria-hidden>
            <span className="absolute top-0 right-0 -translate-y-1/2">{formatUsd(max)}</span>
            <span className="absolute top-1/2 right-0 -translate-y-1/2">{formatUsd(max / 2)}</span>
            <span className="absolute right-0 bottom-0 translate-y-1/2">$0</span>
          </div>

          <div
            className="relative h-44"
            role="img"
            aria-label={`Daily LLM cost over ${days.length} days, total ${formatUsd(total)}`}
            onMouseLeave={() => setHover(null)}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border/70" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border/70" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border" />
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {days.map((d, i) => (
                <div
                  key={d.date}
                  className={cn("flex h-full min-w-0 flex-1 items-end rounded-sm", hover === i && "bg-muted/60")}
                  onMouseEnter={() => setHover(i)}
                >
                  <div
                    className={cn(
                      "w-full rounded-t-[3px] bg-brand transition-opacity duration-150",
                      hover !== null && hover !== i && "opacity-40",
                    )}
                    style={{ height: `${barPercent(d.usd, max)}%` }}
                  />
                </div>
              ))}
            </div>
            {hovered && hover !== null && (
              <DailyCostTooltip
                day={hovered}
                centerFraction={(hover + 0.5) / days.length}
                barPercent={barPercent(hovered.usd, max)}
              />
            )}
          </div>

          <div />
          <div className="relative mt-2 h-4 text-[10px] tabular-nums text-muted-foreground" aria-hidden>
            {ticks.map((i) => {
              const d = days[i]!;
              const edge = i === 0 ? { left: 0 } : i === days.length - 1 ? { right: 0 } : { left: `${((i + 0.5) / days.length) * 100}%` };
              return (
                <span key={d.date} className={cn("absolute", i !== 0 && i !== days.length - 1 && "-translate-x-1/2")} style={edge}>
                  {formatDay(d.date)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { RatioBar } from "@/components/shared/RatioBar";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatUsd } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { useOverviewStore, type OverviewTable } from "@/stores/useOverviewStore";

export interface CostRow {
  key: string;
  calls: number;
  usd: number;
}

/**
 * Amaç/model kırılımı — maliyete göre azalan, payı oran çubuğuyla. İstemci sayfalı
 * (liste sözleşmesi): sayfa durumu store'da, aralık değişince 1.
 */
export function CostBreakdownCard({
  table,
  title,
  keyLabel,
  noun,
  rows,
  totalUsd,
}: {
  table: Exclude<OverviewTable, "topUsers">;
  title: string;
  keyLabel: string;
  noun: string;
  rows: CostRow[];
  totalUsd: number;
}) {
  const paging = useOverviewStore((s) => s.paging[table]);
  const setPaging = useOverviewStore((s) => s.setPaging);
  const sorted = useMemo(() => [...rows].sort((a, b) => b.usd - a.usd || b.calls - a.calls), [rows]);
  const paged = useMemo(() => paginate(sorted, paging.page, paging.pageSize), [sorted, paging]);
  const calls = rows.reduce((a, r) => a + r.calls, 0);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {calls} call{calls === 1 ? "" : "s"} · {formatUsd(totalUsd)}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No LLM calls in this range.</p>
      ) : (
        <>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-1 text-left font-medium">{keyLabel}</th>
                <th className="pb-1 text-right font-medium">Calls</th>
                <th className="pb-1 text-right font-medium">Cost</th>
                <th className="w-36 pb-1 pl-4 text-left font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((r) => (
                <tr key={r.key} className="border-t border-border/60">
                  <td className="max-w-48 truncate py-1.5 font-mono" title={r.key}>
                    {r.key}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{r.calls}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatUsd(r.usd)}</td>
                  <td className="py-1.5 pl-4">
                    <RatioBar ratio={totalUsd > 0 ? r.usd / totalUsd : 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            paged={paged}
            onPage={(page) => setPaging(table, { page })}
            onPageSize={(pageSize) => setPaging(table, { pageSize })}
            noun={noun}
          />
        </>
      )}
    </section>
  );
}

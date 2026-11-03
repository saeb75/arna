"use client";

import type { AdminUserDetail } from "@glotmate/contracts";
import { useMemo } from "react";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatUsd } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { useUserDetailStore } from "@/stores/useUserDetailStore";

/** LLM maliyeti — toplam, son 30 gün, amaç kırılımı (maliyete göre azalan, istemci sayfalı). Renk yok; sayılar konuşur. */
export function CostCard({ cost }: { cost: AdminUserDetail["cost"] }) {
  const paging = useUserDetailStore((s) => s.paging.cost);
  const setPaging = useUserDetailStore((s) => s.setPaging);
  const sorted = useMemo(() => [...cost.byPurpose].sort((a, b) => b.usd - a.usd || b.calls - a.calls), [cost.byPurpose]);
  const paged = useMemo(() => paginate(sorted, paging.page, paging.pageSize), [sorted, paging]);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">LLM cost</h2>
      <div className="flex gap-8">
        <div>
          <p className="text-xs text-muted-foreground">All time</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{formatUsd(cost.totalUsd)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{formatUsd(cost.last30dUsd)}</p>
        </div>
      </div>
      {sorted.length > 0 && (
        <>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-1 text-left font-medium">Purpose</th>
                <th className="pb-1 text-right font-medium">Calls</th>
                <th className="pb-1 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((r) => (
                <tr key={r.purpose} className="border-t border-border/60">
                  <td className="py-1 font-mono">{r.purpose}</td>
                  <td className="py-1 text-right tabular-nums">{r.calls}</td>
                  <td className="py-1 text-right tabular-nums">{formatUsd(r.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            paged={paged}
            onPage={(page) => setPaging("cost", { page })}
            onPageSize={(pageSize) => setPaging("cost", { pageSize })}
            noun="purposes"
          />
        </>
      )}
    </section>
  );
}

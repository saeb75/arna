"use client";

import type { AdminOverview } from "@glotmate/contracts";
import Link from "next/link";
import { useMemo } from "react";
import { RatioBar } from "@/components/shared/RatioBar";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatUsd } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { useOverviewStore } from "@/stores/useOverviewStore";

/**
 * Aralıkta en pahalı 10 kullanıcı (sunucu kesiti — sıralama maliyete göre).
 * Satır kullanıcı detayına bağlanır; pay, aralığın toplam maliyetine göre.
 */
export function TopUsersCard({ users, totalUsd }: { users: AdminOverview["cost"]["topUsers"]; totalUsd: number }) {
  const paging = useOverviewStore((s) => s.paging.topUsers);
  const setPaging = useOverviewStore((s) => s.setPaging);
  const ranked = useMemo(() => [...users].sort((a, b) => b.usd - a.usd).map((u, i) => ({ ...u, rank: i + 1 })), [users]);
  const paged = useMemo(() => paginate(ranked, paging.page, paging.pageSize), [ranked, paging]);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Top users by cost</h2>
        <span className="text-xs text-muted-foreground">top 10 in range</span>
      </div>
      {ranked.length === 0 ? (
        <p className="text-sm text-muted-foreground">No user-attributed LLM calls in this range.</p>
      ) : (
        <>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="w-8 pb-1 text-left font-medium">#</th>
                <th className="pb-1 text-left font-medium">User</th>
                <th className="pb-1 text-right font-medium">Calls</th>
                <th className="pb-1 text-right font-medium">Cost</th>
                <th className="w-40 pb-1 pl-4 text-left font-medium">Share of total</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((u) => (
                <tr key={u.userId} className="border-t border-border/60">
                  <td className="py-1.5 tabular-nums text-muted-foreground">{u.rank}</td>
                  <td className="max-w-xs py-1.5">
                    <Link href={`/users/${u.userId}`} className="block truncate font-medium hover:underline">
                      {u.email ?? u.name ?? <span className="font-mono text-muted-foreground">{u.userId.slice(0, 8)}</span>}
                    </Link>
                    {u.email && u.name && <p className="truncate text-muted-foreground">{u.name}</p>}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{u.calls}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatUsd(u.usd)}</td>
                  <td className="py-1.5 pl-4">
                    <RatioBar ratio={totalUsd > 0 ? u.usd / totalUsd : 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            paged={paged}
            onPage={(page) => setPaging("topUsers", { page })}
            onPageSize={(pageSize) => setPaging("topUsers", { pageSize })}
            noun="users"
          />
        </>
      )}
    </section>
  );
}

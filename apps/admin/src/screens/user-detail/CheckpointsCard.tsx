"use client";

import type { AdminUserDetail } from "@glotmate/contracts";
import { useMemo } from "react";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatDateTime } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { useUserDetailStore } from "@/stores/useUserDetailStore";

/** Ünite sonu testleri — ayna, kapı değil; her deneme ayrı satır, yeniden eskiye, istemci sayfalı. */
export function CheckpointsCard({ checkpoints }: { checkpoints: AdminUserDetail["checkpoints"] }) {
  const paging = useUserDetailStore((s) => s.paging.checkpoints);
  const setPaging = useUserDetailStore((s) => s.setPaging);
  const sorted = useMemo(() => [...checkpoints].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [checkpoints]);
  const paged = useMemo(() => paginate(sorted, paging.page, paging.pageSize), [sorted, paging]);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Unit tests</h2>
        {checkpoints.length > 0 && <span className="text-xs tabular-nums text-muted-foreground">{checkpoints.length} taken</span>}
      </div>
      {checkpoints.length === 0 ? (
        <p className="text-sm text-muted-foreground">No unit tests taken yet.</p>
      ) : (
        <>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-1 text-left font-medium">Unit</th>
                <th className="pb-1 text-right font-medium">Score</th>
                <th className="pb-1 text-right font-medium">Taken</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((c, i) => (
                <tr key={`${c.createdAt}-${i}`} className="border-t border-border/60">
                  <td className="py-1">
                    <span className="font-mono">{c.level}</span> · Unit {c.unitIndex}
                  </td>
                  <td className="py-1 text-right tabular-nums">
                    <span className="font-medium">{c.score}</span>
                    <span className="text-muted-foreground"> / {c.total}</span>
                  </td>
                  <td className="py-1 text-right text-muted-foreground">{formatDateTime(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            paged={paged}
            onPage={(page) => setPaging("checkpoints", { page })}
            onPageSize={(pageSize) => setPaging("checkpoints", { pageSize })}
            noun="tests"
          />
        </>
      )}
    </section>
  );
}

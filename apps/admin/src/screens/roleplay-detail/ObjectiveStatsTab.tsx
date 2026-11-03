"use client";

import type { AdminRoleplayDetail } from "@glotmate/contracts";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { RatioBar } from "@/components/shared/RatioBar";
import { TablePagination } from "@/components/shared/TablePagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paginate } from "@/lib/paginate";
import { useRoleplayDetailStore } from "@/stores/useRoleplayDetailStore";

/**
 * Hedef başına isabet: biten denemelerde hedef kaç kez GÖSTERİLDİ, kaçında tiklendi.
 * Sıra güncel spec sırası (sunucu), eski denemelerde kalan hedefler sonda.
 * Düşük oran = persona kapı açmıyor (openingHint?) ya da hedef dünya durumu gibi yazılmış.
 */
export function ObjectiveStatsTab({ stats }: { stats: AdminRoleplayDetail["objectiveStats"] }) {
  const paging = useRoleplayDetailStore((s) => s.paging.stats);
  const setPaging = useRoleplayDetailStore((s) => s.setPaging);
  const paged = useMemo(() => paginate(stats, paging.page, paging.pageSize), [stats, paging]);

  if (stats.length === 0) return <EmptyState title="No objectives" hint="This role-play has no objectives to report on." />;
  const anyShown = stats.some((s) => s.shown > 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Ended attempts with at least one student turn. {anyShown ? "" : "No ended attempts yet — rates appear after the first finished session."}
      </p>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Objective</TableHead>
              <TableHead className="w-24 text-right">Shown</TableHead>
              <TableHead className="w-24 text-right">Hit</TableHead>
              <TableHead className="w-56 pr-4">Hit rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.items.map((s) => (
              <TableRow key={s.objectiveId}>
                <TableCell className="max-w-md pl-4 text-xs">
                  <p className="truncate font-medium">{s.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {s.objectiveId}
                    {s.label === s.objectiveId && " · not in the current spec"}
                  </p>
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">{s.shown}</TableCell>
                <TableCell className="text-right text-xs tabular-nums">{s.hit}</TableCell>
                <TableCell className="pr-4">
                  <RatioBar ratio={s.shown > 0 ? s.hit / s.shown : null} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        paged={paged}
        onPage={(page) => setPaging("stats", { page })}
        onPageSize={(pageSize) => setPaging("stats", { pageSize })}
        noun="objectives"
      />
    </div>
  );
}

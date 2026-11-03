"use client";

import { useEffect, useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TablePagination } from "@/components/shared/TablePagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleplayDetailController } from "@/controllers/RoleplayDetailController";
import { pagedFromServer } from "@/lib/paginate";
import { cn } from "@/lib/utils";
import { useRoleplayDetailStore } from "@/stores/useRoleplayDetailStore";
import { AttemptRow } from "@/screens/roleplay-detail/AttemptRow";

/**
 * Denemeler — BÜYÜYEN liste, sunucu sayfalı (yeniden eskiye). Sekme açılınca çekilir;
 * sayfa değişiminde tablo yerinde kalır, soluklaşır.
 */
export function AttemptsTab({ roleplayId }: { roleplayId: string }) {
  const { attempts, attemptsLoading, attemptsError } = useRoleplayDetailStore();

  useEffect(() => {
    void RoleplayDetailController.loadAttempts(roleplayId);
  }, [roleplayId]);

  const paged = useMemo(
    () => (attempts ? pagedFromServer(attempts.items, attempts.page, attempts.pageSize, attempts.total) : null),
    [attempts],
  );

  if (attemptsError && !attempts) {
    return <ErrorState code={attemptsError} onRetry={() => void RoleplayDetailController.loadAttempts(roleplayId)} />;
  }
  if (!attempts || !paged) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }
  if (attempts.total === 0) {
    return <EmptyState title="No attempts yet" hint="Attempts appear once students play a published revision." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-opacity", attemptsLoading && "opacity-60")}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">User</TableHead>
              <TableHead className="w-20">Revision</TableHead>
              <TableHead className="w-20">Level</TableHead>
              <TableHead className="w-40">Objectives</TableHead>
              <TableHead className="w-20 text-right">Turns</TableHead>
              <TableHead className="w-32">Started</TableHead>
              <TableHead className="w-28">Ended</TableHead>
              <TableHead className="w-24 pr-4 text-right">Session</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.items.map((a) => (
              <AttemptRow key={a.sessionId} attempt={a} />
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        paged={paged}
        onPage={(page) => RoleplayDetailController.setAttemptsQuery(roleplayId, { page })}
        onPageSize={(pageSize) => RoleplayDetailController.setAttemptsQuery(roleplayId, { pageSize })}
        noun="attempts"
      />
    </div>
  );
}

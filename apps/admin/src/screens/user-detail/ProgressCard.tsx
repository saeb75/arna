"use client";

import type { AdminUserProgress } from "@glotmate/contracts";
import Link from "next/link";
import { useMemo } from "react";
import { TablePagination } from "@/components/shared/TablePagination";
import { Badge } from "@/components/ui/badge";
import { KIND_LABEL, formatDateTime, formatRelative } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { useUserDetailStore } from "@/stores/useUserDetailStore";
import { ProgressStatusBadge } from "@/screens/user-detail/ProgressStatusBadge";

/** Son hareket: tamamlandıysa tamamlanma, değilse ilk başlangıç */
const lastMove = (p: AdminUserProgress) => p.completedAt ?? p.firstStartedAt;

/**
 * Başlanan dersler (seyrek tablo: satırı olmayan ders hiç açılmamış demek).
 * En son hareket önce; istemci sayfalı (detay yükünde tam gelir).
 */
export function ProgressCard({ progress }: { progress: AdminUserProgress[] }) {
  const paging = useUserDetailStore((s) => s.paging.progress);
  const setPaging = useUserDetailStore((s) => s.setPaging);
  const sorted = useMemo(() => [...progress].sort((a, b) => lastMove(b).localeCompare(lastMove(a))), [progress]);
  const paged = useMemo(() => paginate(sorted, paging.page, paging.pageSize), [sorted, paging]);
  const done = progress.filter((p) => p.status === "completed").length;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Lesson progress</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {done} completed · {progress.length - done} in progress
        </span>
      </div>
      {progress.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lessons started yet.</p>
      ) : (
        <>
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {paged.items.map((p) => (
              <li key={p.catalogLessonId} className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs">
                <Badge variant="outline" className="font-mono text-[10px]">{p.level}</Badge>
                <Link href={`/lessons/${p.catalogLessonId}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                  {p.title}
                </Link>
                <span className="text-muted-foreground">{KIND_LABEL[p.kind]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {p.sessionCount} session{p.sessionCount === 1 ? "" : "s"}
                </span>
                <ProgressStatusBadge status={p.status} />
                <span className="w-24 text-right text-muted-foreground" title={formatDateTime(lastMove(p))}>
                  {formatRelative(lastMove(p))}
                </span>
              </li>
            ))}
          </ul>
          <TablePagination
            paged={paged}
            onPage={(page) => setPaging("progress", { page })}
            onPageSize={(pageSize) => setPaging("progress", { pageSize })}
            noun="lessons"
          />
        </>
      )}
    </section>
  );
}

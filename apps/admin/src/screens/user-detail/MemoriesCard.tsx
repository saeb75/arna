"use client";

import { useMemo } from "react";
import { TablePagination } from "@/components/shared/TablePagination";
import { Badge } from "@/components/ui/badge";
import { UserDetailController } from "@/controllers/UserDetailController";
import { formatDateTime, formatRelative } from "@/lib/labels";
import { pagedFromServer } from "@/lib/paginate";
import { cn } from "@/lib/utils";
import { useUserDetailStore } from "@/stores/useUserDetailStore";
import { CardListState } from "@/screens/user-detail/CardListState";

/** Hafıza gerçekleri — öğrencinin kendi sözünden türer; sunucu sayfalı, yeniden eskiye, salt okunur. */
export function MemoriesCard({ userId }: { userId: string }) {
  const { data, loading, error } = useUserDetailStore((s) => s.memories);
  const paged = useMemo(() => (data ? pagedFromServer(data.items, data.page, data.pageSize, data.total) : null), [data]);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Memory</h2>
          {data && <span className="text-xs tabular-nums text-muted-foreground">{data.total} facts</span>}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Facts extracted from the learner&apos;s own speech. Read-only — grammar performance is never stored here.
        </p>
      </div>
      {!data || !paged ? (
        <CardListState error={error} onRetry={() => void UserDetailController.loadMemories(userId)} />
      ) : data.total === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing extracted yet.</p>
      ) : (
        <>
          <table className={cn("w-full text-xs transition-opacity", loading && "opacity-60")}>
            <thead className="text-muted-foreground">
              <tr>
                <th className="w-24 pb-1 text-left font-medium">Kind</th>
                <th className="pb-1 text-left font-medium">Fact</th>
                <th className="w-24 pb-1 text-right font-medium">Extracted</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((m) => (
                <tr key={m.id} className="border-t border-border/60 align-top">
                  <td className="py-1.5 pr-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{m.kind}</Badge>
                  </td>
                  <td className="py-1.5">{m.text}</td>
                  <td className="py-1.5 text-right text-muted-foreground">
                    <span title={formatDateTime(m.createdAt)}>{formatRelative(m.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            paged={paged}
            onPage={(page) => UserDetailController.setMemoriesQuery(userId, { page })}
            onPageSize={(pageSize) => UserDetailController.setMemoriesQuery(userId, { pageSize })}
            noun="facts"
          />
        </>
      )}
    </section>
  );
}

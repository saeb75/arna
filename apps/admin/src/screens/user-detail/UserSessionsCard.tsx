"use client";

import { useMemo } from "react";
import { TablePagination } from "@/components/shared/TablePagination";
import { UserDetailController } from "@/controllers/UserDetailController";
import { pagedFromServer } from "@/lib/paginate";
import { cn } from "@/lib/utils";
import { useUserDetailStore } from "@/stores/useUserDetailStore";
import { CardListState } from "@/screens/user-detail/CardListState";
import { UserSessionRow } from "@/screens/user-detail/UserSessionRow";

/**
 * Kullanıcının TÜM oturumları — sunucu sayfalı, yeniden eskiye ("son 20" kesiti değil).
 * Transkript burada yok; satırdan oturum detayına gidilir.
 */
export function UserSessionsCard({ userId }: { userId: string }) {
  const { data, loading, error } = useUserDetailStore((s) => s.sessions);
  const paged = useMemo(() => (data ? pagedFromServer(data.items, data.page, data.pageSize, data.total) : null), [data]);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Sessions</h2>
        {data && <span className="text-xs tabular-nums text-muted-foreground">{data.total} in total</span>}
      </div>
      {!data || !paged ? (
        <CardListState error={error} onRetry={() => void UserDetailController.loadSessions(userId)} />
      ) : data.total === 0 ? (
        <p className="text-sm text-muted-foreground">No sessions yet.</p>
      ) : (
        <>
          <div className={cn("overflow-x-auto transition-opacity", loading && "opacity-60")}>
            <table className="w-full">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="w-28 pb-1 text-left font-medium">Started</th>
                  <th className="w-24 pb-1 text-left font-medium">Type</th>
                  <th className="pb-1 text-left font-medium">Lesson / role-play</th>
                  <th className="w-20 pb-1 text-left font-medium">Duration</th>
                  <th className="w-28 pb-1 text-left font-medium">Summary</th>
                  <th className="w-24 pb-1" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((s) => (
                  <UserSessionRow key={s.id} session={s} />
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            paged={paged}
            onPage={(page) => UserDetailController.setSessionsQuery(userId, { page })}
            onPageSize={(pageSize) => UserDetailController.setSessionsQuery(userId, { pageSize })}
            noun="sessions"
          />
        </>
      )}
    </section>
  );
}

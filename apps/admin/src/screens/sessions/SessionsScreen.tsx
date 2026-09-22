"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { SessionsController } from "@/controllers/SessionsController";
import { formatDateTime } from "@/lib/labels";
import { pagedFromServer } from "@/lib/paginate";
import { useSessionsStore } from "@/stores/useSessionsStore";
import { SessionsSkeleton } from "@/screens/sessions/SessionsSkeleton";
import { SessionsSummary } from "@/screens/sessions/SessionsSummary";
import { SessionsTable } from "@/screens/sessions/SessionsTable";
import { SessionsToolbar } from "@/screens/sessions/SessionsToolbar";

/** Oturumlar — bug avı listesi. Süzme/sıralama/sayfalama SUNUCUDA; tablo veri eldeyken yerinde kalır. */
export function SessionsScreen() {
  const { data, loading, error } = useSessionsStore();

  useEffect(() => {
    void SessionsController.load();
  }, []);

  const paged = useMemo(() => (data ? pagedFromServer(data.sessions, data.page, data.pageSize, data.total) : null), [data]);

  return (
    <>
      <PageHeader
        title="Sessions"
        description={
          data ? `${data.stats.total} sessions in total · updated ${formatDateTime(data.generatedAt)}` : "Every lesson and role-play session, newest first"
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => void SessionsController.load()} disabled={loading}>
            <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
            Refresh
          </Button>
        }
      />

      {error && !data ? (
        <ErrorState code={error} onRetry={() => void SessionsController.load()} />
      ) : !data || !paged ? (
        <SessionsSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <SessionsSummary stats={data.stats} />
          <SessionsToolbar total={data.total} />
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <SessionsTable key={`${data.page}-${data.pageSize}`} sessions={paged.items} />
          </div>
          <TablePagination
            paged={paged}
            onPage={(p) => SessionsController.setPage(p)}
            onPageSize={(pageSize) => SessionsController.setQuery({ pageSize })}
            noun="sessions"
          />
        </div>
      )}
    </>
  );
}

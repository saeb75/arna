"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SessionsController } from "@/controllers/SessionsController";
import { formatDateTime } from "@/lib/labels";
import { applySessionFilters, sortSessions, summarizeSessions } from "@/lib/sessionFilters";
import { useSessionsStore } from "@/stores/useSessionsStore";
import { SessionsSkeleton } from "@/screens/sessions/SessionsSkeleton";
import { SessionsSummary } from "@/screens/sessions/SessionsSummary";
import { SessionsTable } from "@/screens/sessions/SessionsTable";
import { SessionsToolbar } from "@/screens/sessions/SessionsToolbar";

/** Oturumlar — bug avı listesi. Sunucu en yeni N'i döner; süzme/sıralama istemcide, saf fonksiyonla. */
export function SessionsScreen() {
  const { data, loading, error, filters, sort } = useSessionsStore();

  useEffect(() => {
    void SessionsController.load();
  }, []);

  const visible = useMemo(() => (data ? sortSessions(applySessionFilters(data.sessions, filters), sort) : []), [data, filters, sort]);
  const summary = useMemo(() => summarizeSessions(data?.sessions ?? []), [data]);

  return (
    <>
      <PageHeader
        title="Sessions"
        description={
          data
            ? `showing the latest ${data.sessions.length} of ${data.total} · updated ${formatDateTime(data.generatedAt)}`
            : "Every lesson and role-play session, newest first"
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
      ) : !data ? (
        <SessionsSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <SessionsSummary summary={summary} />
          <SessionsToolbar visibleCount={visible.length} loadedCount={data.sessions.length} />
          <SessionsTable sessions={visible} />
        </div>
      )}
    </>
  );
}

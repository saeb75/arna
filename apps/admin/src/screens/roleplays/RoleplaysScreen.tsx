"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { RoleplaysController } from "@/controllers/RoleplaysController";
import { formatDateTime } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { applyRoleplayFilters, roleplayCategories, sortRoleplays, summarizeRoleplays } from "@/lib/roleplayFilters";
import { useRoleplaysStore } from "@/stores/useRoleplaysStore";
import { RoleplaysSkeleton } from "@/screens/roleplays/RoleplaysSkeleton";
import { RoleplaysSummary } from "@/screens/roleplays/RoleplaysSummary";
import { RoleplaysTable } from "@/screens/roleplays/RoleplaysTable";
import { RoleplaysToolbar } from "@/screens/roleplays/RoleplaysToolbar";

/**
 * Roleplay senaryoları — DB kaynaklı içerik (müfredatın tersine panelden yazılır).
 * Sınırlı liste: süzme → sıralama → sayfalama istemcide. Skeleton yalnız veri yokken.
 */
export function RoleplaysScreen() {
  const { data, loading, error, filters, sort, page, pageSize, setPage, setPageSize } = useRoleplaysStore();

  useEffect(() => {
    void RoleplaysController.load();
  }, []);

  const rows = useMemo(() => data?.roleplays ?? [], [data]);
  const visible = useMemo(() => sortRoleplays(applyRoleplayFilters(rows, filters), sort), [rows, filters, sort]);
  const summary = useMemo(() => summarizeRoleplays(rows), [rows]);
  const categories = useMemo(() => roleplayCategories(rows), [rows]);
  const paged = useMemo(() => paginate(visible, page, pageSize), [visible, page, pageSize]);

  return (
    <>
      <PageHeader
        title="Roleplays"
        description={
          data ? `${rows.length} scenarios · updated ${formatDateTime(data.generatedAt)}` : "Standalone role-play scenarios, revisions and attempts"
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void RoleplaysController.load()} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
            <Link href="/roleplays/new" className={buttonVariants({ size: "sm" })}>
              <Plus data-icon="inline-start" />
              New roleplay
            </Link>
          </>
        }
      />

      {error && !data ? (
        <ErrorState code={error} onRetry={() => void RoleplaysController.load()} />
      ) : !data ? (
        <RoleplaysSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <RoleplaysSummary summary={summary} />
          <RoleplaysToolbar categories={categories} visibleCount={visible.length} totalCount={rows.length} />
          <RoleplaysTable key={`${paged.page}-${sort}`} rows={paged.items} filtered={rows.length > 0} />
          <TablePagination paged={paged} onPage={setPage} onPageSize={setPageSize} noun="role-plays" />
        </div>
      )}
    </>
  );
}

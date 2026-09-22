"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersController } from "@/controllers/UsersController";
import { formatDateTime } from "@/lib/labels";
import { applyUserFilters, summarizeUsers } from "@/lib/userFilters";
import { useUsersStore } from "@/stores/useUsersStore";
import { UsersSkeleton } from "@/screens/users/UsersSkeleton";
import { UsersSummary } from "@/screens/users/UsersSummary";
import { UsersTable } from "@/screens/users/UsersTable";
import { UsersToolbar } from "@/screens/users/UsersToolbar";

/** Kullanıcı listesi — salt okunur; süzme istemcide, saf fonksiyonla. Skeleton yalnız veri yokken. */
export function UsersScreen() {
  const { data, loading, error, filters } = useUsersStore();

  useEffect(() => {
    void UsersController.load();
  }, []);

  const visible = useMemo(() => (data ? applyUserFilters(data.users, filters) : []), [data, filters]);
  const summary = useMemo(() => summarizeUsers(data?.users ?? []), [data]);

  return (
    <>
      <PageHeader
        title="Users"
        description={
          data ? `${data.users.length} accounts · updated ${formatDateTime(data.generatedAt)}` : "Accounts, profiles and activity"
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => void UsersController.load()} disabled={loading}>
            <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
            Refresh
          </Button>
        }
      />

      {error && !data ? (
        <ErrorState code={error} onRetry={() => void UsersController.load()} />
      ) : !data ? (
        <UsersSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <UsersSummary summary={summary} />
          <UsersToolbar visibleCount={visible.length} totalCount={data.users.length} />
          <UsersTable users={visible} />
        </div>
      )}
    </>
  );
}

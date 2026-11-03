"use client";

import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { OverviewController } from "@/controllers/OverviewController";
import { formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useOverviewStore } from "@/stores/useOverviewStore";
import { CostBreakdownCard } from "@/screens/overview/CostBreakdownCard";
import { DailyCostChart } from "@/screens/overview/DailyCostChart";
import { OverviewSkeleton } from "@/screens/overview/OverviewSkeleton";
import { OverviewStats } from "@/screens/overview/OverviewStats";
import { RangeTabs } from "@/screens/overview/RangeTabs";
import { TopUsersCard } from "@/screens/overview/TopUsersCard";

/**
 * Açılış panosu: kullanıcı/aktiflik/Pro/oturum sayaçları + `llm_calls` maliyeti.
 * Skeleton yalnız veri yokken; aralık değişiminde pano yerinde kalır, soluklaşır.
 */
export function OverviewScreen() {
  const { data, loading, error } = useOverviewStore();

  useEffect(() => {
    void OverviewController.load();
  }, []);

  return (
    <>
      <PageHeader
        title="Overview"
        description={
          data ? `Last ${data.days} days · updated ${formatDateTime(data.generatedAt)}` : "Users, activity, subscriptions and LLM cost"
        }
        actions={
          <>
            <RangeTabs />
            <Button variant="outline" size="sm" onClick={() => void OverviewController.load()} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
          </>
        }
      />

      {error && !data ? (
        <ErrorState code={error} onRetry={() => void OverviewController.load()} />
      ) : !data ? (
        <OverviewSkeleton />
      ) : (
        <div className={cn("flex flex-col gap-5 transition-opacity", loading && "opacity-60")}>
          <OverviewStats data={data} />
          <DailyCostChart days={data.cost.byDay} />
          <div className="grid gap-4 lg:grid-cols-2">
            <CostBreakdownCard
              table="purpose"
              title="Cost by purpose"
              keyLabel="Purpose"
              noun="purposes"
              rows={data.cost.byPurpose.map((r) => ({ key: r.purpose, calls: r.calls, usd: r.usd }))}
              totalUsd={data.cost.totalUsd}
            />
            <CostBreakdownCard
              table="model"
              title="Cost by model"
              keyLabel="Model"
              noun="models"
              rows={data.cost.byModel.map((r) => ({ key: r.model, calls: r.calls, usd: r.usd }))}
              totalUsd={data.cost.totalUsd}
            />
          </div>
          <TopUsersCard users={data.cost.topUsers} totalUsd={data.cost.totalUsd} />
        </div>
      )}
    </>
  );
}

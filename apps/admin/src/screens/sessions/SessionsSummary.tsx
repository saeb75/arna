"use client";

import { StatCard } from "@/components/shared/StatCard";
import { formatDuration, formatUsd } from "@/lib/labels";
import type { SessionsSummary as Summary } from "@/lib/sessionFilters";

export function SessionsSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Sessions loaded" value={summary.total} hint={`${summary.open} still open`} />
      <StatCard label="With errors observed" value={summary.withErrors} total={summary.total} />
      <StatCard
        label="Avg. duration (ended)"
        value={summary.avgDurationSec ?? 0}
        format={(v) => (summary.avgDurationSec === null ? "—" : formatDuration(Math.round(v)))}
      />
      <StatCard label="LLM cost" value={summary.totalCostUsd} format={formatUsd} hint="loaded sessions" />
    </div>
  );
}

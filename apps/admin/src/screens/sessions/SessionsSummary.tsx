"use client";

import type { AdminSessionsStats } from "@glotmate/contracts";
import { StatCard } from "@/components/shared/StatCard";
import { formatDuration, formatUsd } from "@/lib/labels";

/** Özet kartları SÜZÜLMEMİŞ tüm oturumlar üzerinden (sunucu `stats`) */
export function SessionsSummary({ stats }: { stats: AdminSessionsStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Sessions" value={stats.total} hint={`${stats.open} still open`} />
      <StatCard label="With errors observed" value={stats.withErrors} total={stats.total} />
      <StatCard
        label="Avg. duration (ended)"
        value={stats.avgDurationSec ?? 0}
        format={(v) => (stats.avgDurationSec === null ? "—" : formatDuration(Math.round(v)))}
      />
      <StatCard label="LLM cost" value={stats.totalCostUsd} format={formatUsd} hint="all sessions" />
    </div>
  );
}

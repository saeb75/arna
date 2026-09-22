"use client";

import { StatCard } from "@/components/shared/StatCard";
import { formatUsd } from "@/lib/labels";
import type { UsersSummary as Summary } from "@/lib/userFilters";

export function UsersSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Accounts" value={summary.total} hint={`${summary.admins} admin${summary.admins === 1 ? "" : "s"}`} />
      <StatCard label="Onboarded" value={summary.withProfile} total={summary.total} />
      <StatCard label="Active (30 days)" value={summary.active30d} total={summary.total} />
      <StatCard label="LLM cost" value={summary.totalCostUsd} format={formatUsd} hint="all time, all users" />
    </div>
  );
}

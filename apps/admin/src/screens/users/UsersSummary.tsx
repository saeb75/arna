"use client";

import { StatCard } from "@/components/shared/StatCard";
import { formatUsd } from "@/lib/labels";
import type { UsersSummary as Summary } from "@/lib/userFilters";

export function UsersSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatCard
        label="Accounts"
        value={summary.total}
        hint={`${summary.guests} guest${summary.guests === 1 ? "" : "s"} · ${summary.admins} admin${summary.admins === 1 ? "" : "s"}`}
      />
      <StatCard label="Onboarded" value={summary.withProfile} total={summary.total} />
      <StatCard label="Active (30 days)" value={summary.active30d} total={summary.total} />
      <StatCard label="Pro" value={summary.pro} total={summary.total} hint="store or admin grant" />
      <StatCard label="LLM cost" value={summary.totalCostUsd} format={formatUsd} hint="all time, all users" />
    </div>
  );
}

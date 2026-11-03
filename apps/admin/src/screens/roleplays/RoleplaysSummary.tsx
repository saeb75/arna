"use client";

import { StatCard } from "@/components/shared/StatCard";
import type { RoleplaysSummary as Summary } from "@/lib/roleplayFilters";

/** Özet SÜZÜLMEMİŞ tüm senaryolar üzerinden */
export function RoleplaysSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Scenarios" value={summary.total} hint={`${summary.retired} retired`} />
      <StatCard label="With a published revision" value={summary.published} total={summary.total} />
      <StatCard label="Open drafts" value={summary.drafts} hint="saved, not yet live" />
      <StatCard label="Attempts (30 days)" value={summary.attempts30d} hint="sessions with at least one student turn" />
    </div>
  );
}

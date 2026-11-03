"use client";

import type { AdminOverview } from "@glotmate/contracts";
import { StatCard } from "@/components/shared/StatCard";
import { formatPercent, formatUsd } from "@/lib/labels";

/**
 * İki sıra: üstte kullanıcılar, altta aktivite + maliyet. "Aktif" = en az bir
 * öğrenci turu olan oturum (yalnız açıp çıkmak sayılmaz); gün sınırı UTC.
 */
export function OverviewStats({ data }: { data: AdminOverview }) {
  const { users, sessions, cost, days } = data;
  const range = `last ${days} days`;
  const perActive = cost.perActiveUserUsd;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Users" value={users.total} hint={`${users.anonymous} guest${users.anonymous === 1 ? "" : "s"}`} />
      <StatCard label="New users" value={users.newInRange} hint={range} />
      <StatCard label="Active today" value={users.activeToday} hint="spoke at least once · UTC day" />
      <StatCard label="Active users" value={users.activeInRange} hint={range} />
      <StatCard
        label="Pro"
        value={users.pro}
        hint={users.total ? `${formatPercent(users.pro / users.total)} of users` : "no users yet"}
      />
      <StatCard label="Lesson sessions" value={sessions.lessonInRange} hint={range} />
      <StatCard label="Role-play sessions" value={sessions.roleplayInRange} hint={range} />
      <StatCard label="Completed lessons" value={sessions.completedLessonsInRange} hint={range} />
      <StatCard label="LLM cost" value={cost.totalUsd} format={formatUsd} hint={range} />
      <StatCard
        label="Cost per active user"
        value={perActive ?? 0}
        format={(v) => (perActive === null ? "—" : formatUsd(v))}
        hint={perActive === null ? "no active users" : range}
      />
    </div>
  );
}

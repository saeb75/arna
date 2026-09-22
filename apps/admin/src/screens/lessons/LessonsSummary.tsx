"use client";

import type { LevelSummary } from "@/lib/lessonFilters";
import { StatCard } from "@/components/shared/StatCard";

export function LessonsSummary({ summary }: { summary: LevelSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Lessons" value={summary.lessons} />
      <StatCard label="Published cores" value={summary.publishedCores} total={summary.lessons} />
      <StatCard label="Published scene sets" value={summary.publishedScenes} total={summary.lessons} />
      <StatCard
        label="Language packs"
        value={summary.locales}
        hint={
          summary.staleLocales > 0
            ? `${summary.languages} languages · ${summary.staleLocales} stale`
            : `${summary.languages} languages`
        }
      />
    </div>
  );
}

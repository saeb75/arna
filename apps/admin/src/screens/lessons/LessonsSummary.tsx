"use client";

import type { LevelSummary } from "@/lib/lessonFilters";
import { StatCard } from "@/screens/lessons/StatCard";

export function LessonsSummary({ summary }: { summary: LevelSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Ders" value={summary.lessons} />
      <StatCard
        label="Yayınlı çekirdek"
        value={summary.publishedCores}
        total={summary.lessons}
        tone={summary.publishedCores === summary.lessons ? "success" : "default"}
      />
      <StatCard
        label="Yayınlı sahne seti"
        value={summary.publishedScenes}
        total={summary.lessons}
        tone={summary.publishedScenes === summary.lessons ? "success" : "default"}
      />
      <StatCard
        label="Dil paketi"
        value={summary.locales}
        hint={
          summary.staleLocales > 0
            ? `${summary.staleLocales} bayat · ${summary.languages} dil`
            : `${summary.languages} dil`
        }
        tone={summary.staleLocales > 0 ? "warning" : "default"}
      />
    </div>
  );
}

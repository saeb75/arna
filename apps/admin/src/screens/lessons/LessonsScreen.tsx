"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { LessonsController } from "@/controllers/LessonsController";
import { formatDateTime } from "@/lib/labels";
import { applyFilters, summarize } from "@/lib/lessonFilters";
import { useLessonsStore } from "@/stores/useLessonsStore";
import { LessonsSkeleton } from "@/screens/lessons/LessonsSkeleton";
import { LessonsSummary } from "@/screens/lessons/LessonsSummary";
import { LessonsTable } from "@/screens/lessons/LessonsTable";
import { LessonsToolbar } from "@/screens/lessons/LessonsToolbar";
import { LevelTabs } from "@/screens/lessons/LevelTabs";
import { WarmProgressBar } from "@/screens/lessons/WarmProgressBar";

/**
 * Ders matrisi. Skeleton YALNIZ veri yokken — yenilemede tablo yerinde kalır,
 * kaydırma sıfırlanmaz (mobil LessonsScreen kuralı). Süzme istemcide, saf fonksiyonla.
 */
export function LessonsScreen() {
  const { data, loading, error, filters } = useLessonsStore();

  useEffect(() => {
    void LessonsController.load();
  }, []);

  const levelLessons = useMemo(
    () => data?.lessons.filter((l) => l.level === filters.level) ?? [],
    [data, filters.level],
  );
  const visible = useMemo(() => (data ? applyFilters(data.lessons, filters) : []), [data, filters]);
  const summary = useMemo(() => summarize(levelLessons), [levelLessons]);

  const refresh = (
    <Button variant="outline" size="sm" onClick={() => void LessonsController.load()} disabled={loading}>
      <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
      Refresh
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Lessons"
        description={
          data
            ? `${data.lessons.length} catalog lessons · updated ${formatDateTime(data.generatedAt)}`
            : "Catalog × core · scene set · language packs"
        }
        actions={refresh}
      />

      {error && !data ? (
        <ErrorState code={error} onRetry={() => void LessonsController.load()} />
      ) : !data ? (
        <LessonsSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <LevelTabs />
          <LessonsSummary summary={summary} />
          <LessonsToolbar visibleCount={visible.length} levelLessons={levelLessons} allLessons={data.lessons} />
          <WarmProgressBar />
          <LessonsTable key={filters.level} lessons={visible} />
        </div>
      )}
    </>
  );
}

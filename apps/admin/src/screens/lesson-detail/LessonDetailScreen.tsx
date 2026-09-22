"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { LessonDetailController } from "@/controllers/LessonDetailController";
import { useLessonDetailStore } from "@/stores/useLessonDetailStore";
import { CoreEditor } from "@/screens/lesson-detail/CoreEditor";
import { LayerCard } from "@/screens/lesson-detail/LayerCard";
import { LessonDetailHeader } from "@/screens/lesson-detail/LessonDetailHeader";
import { LessonDetailSkeleton } from "@/screens/lesson-detail/LessonDetailSkeleton";
import { LocalesCard } from "@/screens/lesson-detail/LocalesCard";
import { SceneList } from "@/screens/lesson-detail/SceneList";

/**
 * Ders detayı: üç katmanın durumu + aksiyonları + çekirdek editörü.
 * Skeleton yalnız veri yokken; mutasyonlar tabloyu yerinde günceller.
 */
export function LessonDetailScreen({ lessonId }: { lessonId: string }) {
  const { detail, error, busy } = useLessonDetailStore();

  useEffect(() => {
    void LessonDetailController.load(lessonId);
  }, [lessonId]);

  if (error && !detail) return <ErrorState code={error} onRetry={() => void LessonDetailController.load(lessonId)} />;
  if (!detail || detail.lesson.id !== lessonId) return <LessonDetailSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <LessonDetailHeader detail={detail} busy={busy} />

      <div className="grid gap-4 lg:grid-cols-2">
        <LayerCard
          title="Core"
          description="English pedagogy: claims, examples, exercises. Regenerating takes the lesson offline until republished."
          layer={detail.core}
          busy={busy === "core"}
          disabled={busy !== null}
          onRegenerate={() => void LessonDetailController.regenerateCore(lessonId)}
        />
        <LayerCard
          title="Scene set"
          description="Role-play variants for the 5 conversation contexts. Bound to the core — review after the core changes."
          layer={detail.sceneSet}
          busy={busy === "scenes"}
          disabled={busy !== null || !detail.core?.core}
          onRegenerate={() => void LessonDetailController.regenerateScenes(lessonId)}
        />
      </div>

      {detail.sceneSet?.scenes && <SceneList scenes={detail.sceneSet.scenes} />}

      <LocalesCard detail={detail} busy={busy} />

      <CoreEditor lessonId={lessonId} />
    </div>
  );
}

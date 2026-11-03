import type { LessonContentV7 } from "@glotmate/contracts";
import type { SessionPhase } from "../../stores/useLessonSessionStore";

/**
 * Üst çubuğun dolumu — SUNUMSAL tahmin (akış kararı DEĞİL): anlatım %70,
 * rol yapma %25, kapanış tam. Practice'te tur tavanı belirsiz, 8 tur referans.
 */
export function lessonProgress(lesson: LessonContentV7, phase: SessionPhase, beatIndex: number, practiceTurn: number): number {
  if (phase === "wrapup" || phase === "done") return 1;
  if (phase === "practice") return 0.7 + Math.min(practiceTurn / 8, 1) * 0.25;
  const beats = lesson.lecture.beats.length || 1;
  return Math.min(beatIndex / beats, 1) * 0.7;
}

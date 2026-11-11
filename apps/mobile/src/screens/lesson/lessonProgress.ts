import { drillProgress, type DrillState, type LessonContentV7 } from "@glotmate/contracts";
import type { SessionPhase } from "../../stores/useLessonSessionStore";

/**
 * Üst çubuğun dolumu — SUNUMSAL tahmin (akış kararı DEĞİL).
 *  · Oyun bloğu olmayan ders: anlatım %70, rol yapma %25, kapanış tam.
 *  · Oyun bloğu olan ders: anlatım %30, blok %45 (dersin en uzun bölümü), rol yapma %20.
 * Practice'te tur tavanı belirsiz, 8 tur referans.
 */
export function lessonProgress(
  lesson: LessonContentV7,
  phase: SessionPhase,
  beatIndex: number,
  practiceTurn: number,
  drill: DrillState | null = null,
): number {
  if (phase === "wrapup" || phase === "done") return 1;
  const beats = lesson.lecture.beats;
  const drillIdx = beats.findIndex((b) => b.kind === "drills");
  const lectureShare = drillIdx === -1 ? 0.7 : 0.3;
  const practiceStart = drillIdx === -1 ? 0.7 : 0.75;
  if (phase === "practice") return practiceStart + Math.min(practiceTurn / 8, 1) * (0.95 - practiceStart);
  if (drillIdx !== -1 && beatIndex >= drillIdx) {
    const block = beats[drillIdx];
    const frac = block?.kind === "drills" && drill ? drillProgress(block.items, drill) : 0;
    return lectureShare + frac * 0.45;
  }
  const lectureBeats = drillIdx === -1 ? beats.length || 1 : drillIdx || 1;
  return Math.min(beatIndex / lectureBeats, 1) * lectureShare;
}

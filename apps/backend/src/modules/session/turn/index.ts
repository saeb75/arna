import type { RichText } from "@glotmate/contracts";
import { runAskTurn } from "./askTurn.js";
import { runsToPlain } from "./prompt.js";
import { runTaskTurn } from "./taskTurn.js";
import type { BeatLog, BeatTurn, LectureTurnInput, TaskTurnResult, TurnLlm } from "./types.js";

export { ASK_TURN_VERSION } from "./askTurn.js";
export { TASK_TURN_VERSION } from "./taskTurn.js";
export type { BeatLog, BeatTurn, Learner, LectureTurnInput, TaskTurnResult, TurnLlm } from "./types.js";

export interface LectureTurnOutput {
  reply: RichText;
  /** Soru bekleyen adımlarda (alıştırma / açık uçlu) yapısal hüküm; ask adımında yok */
  task?: TaskTurnResult;
  /** Soru penceresi: öğrencinin sorusu kalmadı (yapısal) — contracts windowDone */
  windowDone?: boolean;
}

/**
 * Lecture adımında öğrencinin sözünü işler — adım türüne göre motoru seçer.
 * Bilinmeyen/cevap beklemeyen adım için `null` (çağıran genel yola düşer).
 */
export async function runLectureTurn(input: LectureTurnInput, llm: TurnLlm): Promise<LectureTurnOutput | null> {
  const beat = input.core.lecture.beats.find((b) => b.id === input.beatId);
  if (!beat) return null;
  if (beat.kind === "exercise" || beat.kind === "open_response") {
    const task = await runTaskTurn(input, beat, llm);
    return { reply: task.reply, task };
  }
  if (beat.kind === "ask") {
    const out = await runAskTurn(input, beat, llm);
    return beat.purpose === "questions" ? { reply: out.reply, windowDone: out.done ?? false } : { reply: out.reply };
  }
  return null;
}

/** Diyaloğun modele giden son kısmı — uzun ısrarlarda bağlam şişmesin. */
const MAX_LOG_TURNS = 16;

/** Bu adımın geçmişi: kayıt başka adıma aitse BOŞ (adım değişince sıfırlanır). */
export function historyFor(log: BeatLog | null | undefined, beatId: string): BeatTurn[] {
  return log?.beatId === beatId ? log.turns : [];
}

/** Bir turdan sonra adım kaydı: öğrenci + Emma (+ görev yeniden gösterildiyse uygulama satırı). */
export function appendToBeatLog(
  log: BeatLog | null | undefined,
  beatId: string,
  studentText: string,
  reply: RichText,
  reAsk: boolean,
): BeatLog {
  const turns: BeatTurn[] = [
    ...historyFor(log, beatId),
    { role: "student", text: studentText },
    { role: "tutor", text: runsToPlain(reply) },
    ...(reAsk ? [{ role: "app" as const, text: "the app showed the task on screen and read it aloud again" }] : []),
  ];
  return { beatId, turns: turns.slice(-MAX_LOG_TURNS) };
}

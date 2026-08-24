import { create } from "zustand";
import type { LessonContentV7, LessonPhase, RichText, SessionScript } from "@arna/contracts";

/**
 * Ders oturumu durumu — web sayfasındaki useState+useRef yığınının store karşılığı.
 * Store'a YALNIZ LessonSessionController yazar (mobil CLAUDE.md sözleşmesi).
 *
 * Web'de ref olan sayaçlar burada düz alan: tepkisel olmaları zararsız, ve
 * "aktarım hatası hak yemez" kuralı için geri alınabilir olmaları yeterli.
 */
export type Awaiting = "ask" | "exercise" | "open_response" | "practice" | "wrapup" | null;

export interface LessonMessage {
  id: string;
  role: "teacher" | "user";
  text: string;
  runs?: RichText;
  /** teach beat'inin maddeleri — balonda satır satır gösterilir */
  points?: RichText[];
}

export type SessionPhase = LessonPhase | "done";

interface LessonSessionState {
  sessionId: string | null;
  lesson: LessonContentV7 | null;
  script: SessionScript | null;
  loadError: string | null;

  started: boolean;
  phase: SessionPhase;
  beatIndex: number;
  awaiting: Awaiting;
  messages: LessonMessage[];
  hint: RichText | null;

  speaking: boolean;
  recording: boolean;
  /** Sunucu düşünürken girişler kilitli */
  busy: boolean;

  // sayaçlar — web'deki ref'lerin karşılığı
  beatExchanges: number;
  invites: number;
  attempt: number;
  praiseIndex: number;
  practiceTurn: number;

  set: (p: Partial<LessonSessionState>) => void;
  pushMessage: (m: LessonMessage) => void;
  reset: () => void;
}

const initial = {
  sessionId: null,
  lesson: null,
  script: null,
  loadError: null,
  started: false,
  phase: "lecture" as SessionPhase,
  beatIndex: 0,
  awaiting: null as Awaiting,
  messages: [] as LessonMessage[],
  hint: null as RichText | null,
  speaking: false,
  recording: false,
  busy: false,
  beatExchanges: 0,
  invites: 0,
  attempt: 0,
  praiseIndex: 0,
  practiceTurn: 0,
};

export const useLessonSessionStore = create<LessonSessionState>((set) => ({
  ...initial,
  set: (p) => set(p),
  pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  reset: () => set(initial),
}));

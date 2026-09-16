import { create } from "zustand";
import type {
  LessonContentV7,
  LessonPhase,
  RichText,
  SessionPosition,
  SessionScript,
  TranscriptTurn,
} from "@arna/contracts";

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

/** GET /v1/lessons/:id/resume yanıtındaki sürdürülebilir oturum paketi */
export interface LessonResume {
  sessionId: string;
  startedAt: string;
  position: SessionPosition;
  script: SessionScript;
  lesson: LessonContentV7;
  transcript: TranscriptTurn[];
}

interface LessonSessionState {
  sessionId: string | null;
  /** Ekranın açtığı katalog dersi — start() oturumu bununla kurar */
  catalogLessonId: string | null;
  lesson: LessonContentV7 | null;
  script: SessionScript | null;
  loadError: string | null;
  /** Açık oturum varsa devam paketi — kart "Devam et / Baştan başla" gösterir */
  resume: LessonResume | null;

  started: boolean;
  phase: SessionPhase;
  beatIndex: number;
  awaiting: Awaiting;
  messages: LessonMessage[];
  hint: RichText | null;

  speaking: boolean;
  recording: boolean;
  /** Sunucu düşünürken girişler kilitli — TEK kilit sebebi bu */
  busy: boolean;
  /**
   * İLERİ SARMA (web'deki `fastForward`): söz kesildi — hoca metni akmaya devam
   * eder ama TTS'e HİÇ gidilmez. Akış bir bekleme noktasına varınca kapanır;
   * tek sahibi `arrive()`.
   */
  fastForward: boolean;
  /**
   * Hoca konuşurken gelen öğrenci sözü: akış `awaiting`'e varana kadar burada
   * bekler, sonra normal yoluna teslim edilir.
   */
  pendingInput: string | null;
  /**
   * Yeni hoca balonu düştükten sonraki kısa kilit (INPUT_GRACE_MS): kullanıcı
   * okumaya fırsat bulmadan yanlışlıkla sözü kesmesin. Kilit YALNIZCA bu aralıkta.
   */
  grace: boolean;
  /**
   * Ekrandan çıkıldı: yürüyen zincir buradan sonra hiçbir şey yazmaz. İleri sarma
   * ağ beklemediği için saniyeler süren bir hayalet zincir bırakabilirdi.
   */
  stopped: boolean;

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
  catalogLessonId: null as string | null,
  lesson: null,
  script: null,
  loadError: null,
  resume: null as LessonResume | null,
  started: false,
  phase: "lecture" as SessionPhase,
  beatIndex: 0,
  awaiting: null as Awaiting,
  messages: [] as LessonMessage[],
  hint: null as RichText | null,
  speaking: false,
  recording: false,
  busy: false,
  fastForward: false,
  pendingInput: null as string | null,
  grace: false,
  stopped: false,
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

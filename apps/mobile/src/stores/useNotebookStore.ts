import { create } from "zustand";
import type { AnswerReview, MistakeItem, MistakeKind, SavedWord } from "@glotmate/contracts";

/** Öğrencinin bir sözünün incelemesi — balonun yanındaki rozet + sheet bunu okur */
export interface ReviewEntry {
  sessionId: string;
  text: string;
  context?: string;
  status: "pending" | "ready" | "failed";
  review: AnswerReview | null;
}

/** Dokunulan kelime — alttaki kart bunu okur (`translation: null` = çevriliyor) */
export interface WordLookup {
  word: string;
  sentence: string | null;
  translation: string | null;
  /** Cümlenin çevirisi — kelimeyi bağlamına oturtur (yoksa null) */
  sentenceTranslation: string | null;
  saved: boolean;
  failed: boolean;
}

export type MistakeFilter = "all" | MistakeKind;

/**
 * DEFTER durumu: oturum içi incelemeler (mesaj kimliğiyle), dokunulan kelime ve
 * Defter sekmesinin iki listesi. Yalnız NotebookController yazar.
 */
interface NotebookState {
  reviews: Record<string, ReviewEntry>;
  /** Sheet'i açık olan mesaj */
  openReviewId: string | null;
  word: WordLookup | null;

  mistakes: MistakeItem[];
  mistakesNext: string | null;
  mistakeCounts: { error: number; unnatural: number };
  mistakeFilter: MistakeFilter;
  mistakesLoading: boolean;
  mistakesLoaded: boolean;
  mistakesError: string | null;

  words: SavedWord[];
  wordsLoading: boolean;
  wordsLoaded: boolean;
  wordsError: string | null;

  /** Defter'de o an seslendirilen metin (düğmenin durumu) */
  speakingText: string | null;

  set: (p: Partial<Omit<NotebookState, "set">>) => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  reviews: {},
  openReviewId: null,
  word: null,
  mistakes: [],
  mistakesNext: null,
  mistakeCounts: { error: 0, unnatural: 0 },
  mistakeFilter: "all",
  mistakesLoading: false,
  mistakesLoaded: false,
  mistakesError: null,
  words: [],
  wordsLoading: false,
  wordsLoaded: false,
  wordsError: null,
  speakingText: null,
  set: (p) => set(p),
}));

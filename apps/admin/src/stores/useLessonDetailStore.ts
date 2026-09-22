import type { AdminLessonDetail, LintReport } from "@glotmate/contracts";
import { create } from "zustand";

/** Hangi aksiyon sürüyor — buton spinner'ları ve çift tıklama kilidi bunu okur */
export type DetailBusy = "core" | "scenes" | "publish" | "lint" | "save" | `locale:${string}`;

/**
 * Ders detayı + çekirdek editörü taslağı. Yalnız LessonDetailController yazar.
 * `draft` store'da: operatör sekme değiştirip dönünce yazdığı JSON kaybolmasın.
 * `draftLessonId` taslağın hangi derse ait olduğunu söyler — başka ders açılınca
 * taslak o dersin çekirdeğinden yeniden kurulur.
 */
interface LessonDetailState {
  detail: AdminLessonDetail | null;
  loading: boolean;
  error: string | null;
  busy: DetailBusy | null;
  draft: string;
  draftLessonId: string | null;
  /** Son sunucu lint raporu (kuru koşu ya da kayıt) */
  lintReport: LintReport | null;
  setDetail: (d: AdminLessonDetail) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setBusy: (b: DetailBusy | null) => void;
  setDraft: (text: string, lessonId: string | null) => void;
  setLintReport: (r: LintReport | null) => void;
  clear: () => void;
}

export const useLessonDetailStore = create<LessonDetailState>((set) => ({
  detail: null,
  loading: false,
  error: null,
  busy: null,
  draft: "",
  draftLessonId: null,
  lintReport: null,
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setBusy: (busy) => set({ busy }),
  setDraft: (draft, draftLessonId) => set({ draft, draftLessonId }),
  setLintReport: (lintReport) => set({ lintReport }),
  clear: () => set({ detail: null, error: null, busy: null, lintReport: null }),
}));

import type { AdminTtsPreviewResponse, AdminTtsSettingsResponse, AdminTutorsResponse } from "@glotmate/contracts";
import { create } from "zustand";
import type { PageSize } from "@/lib/paginate";
import type { TutorEditorMode, TutorForm } from "@/lib/tutorDraft";

/** Oluştur/düzenle diyaloğunun durumu — form store'da, diyalog kapanınca içerik kapanış animasyonu boyunca durur */
export interface TutorEditor {
  mode: TutorEditorMode;
  /** Düzenlenen öğretmenin kimliği; oluştururken null */
  originalId: string | null;
  form: TutorForm;
  /** Açılıştaki hâl — kirli = `formKey(form) !== baseline` */
  baseline: string;
  /** Kaydet denendi mi — boş zorunlu alanların hatası ancak o zaman görünür */
  attempted: boolean;
}

export interface TutorSample extends AdminTtsPreviewResponse {
  /** Seslendirilen cümle (sunucunun tanıtım cümlesi) */
  text: string;
  /** Aynı sesi ikinci kez dinlemede oynatıcı yeniden çalsın diye */
  at: number;
}

/**
 * Öğretmenler ekranı. `data` liste + bağlanabilir rig'ler, `tts` ses seçenekleri
 * (sağlayıcı anahtarı/model/katalog). Yalnız TutorsController yazar; sayfa/ebat
 * saf sunum durumu (ekran setter'ı doğrudan çağırır).
 */
interface TutorsState {
  data: AdminTutorsResponse | null;
  tts: AdminTtsSettingsResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: PageSize;
  editor: TutorEditor | null;
  editorOpen: boolean;
  saving: boolean;
  sampling: boolean;
  sample: TutorSample | null;
  setData: (d: AdminTutorsResponse, tts: AdminTtsSettingsResponse) => void;
  setList: (d: AdminTutorsResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setPage: (p: number) => void;
  setPageSize: (n: PageSize) => void;
  setEditor: (e: TutorEditor | null) => void;
  setEditorOpen: (v: boolean) => void;
  setSaving: (v: boolean) => void;
  setSampling: (v: boolean) => void;
  setSample: (s: TutorSample | null) => void;
}

export const useTutorsStore = create<TutorsState>((set) => ({
  data: null,
  tts: null,
  loading: false,
  error: null,
  page: 1,
  pageSize: 25,
  editor: null,
  editorOpen: false,
  saving: false,
  sampling: false,
  sample: null,
  setData: (data, tts) => set({ data, tts, error: null }),
  setList: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setEditor: (editor) => set({ editor }),
  setEditorOpen: (editorOpen) => set({ editorOpen }),
  setSaving: (saving) => set({ saving }),
  setSampling: (sampling) => set({ sampling }),
  setSample: (sample) => set({ sample }),
}));

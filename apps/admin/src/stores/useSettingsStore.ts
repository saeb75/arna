import type { AdminTtsPreviewResponse, AdminTtsSettingsResponse, TtsProvider, TtsSettings } from "@glotmate/contracts";
import { create } from "zustand";

export interface TtsPreview extends AdminTtsPreviewResponse {
  provider: TtsProvider;
  /** Aynı sesi ikinci kez dinlemede effect tetiklensin diye */
  at: number;
}

/**
 * Tutor sesi ayarları durumu. `data` sunucudaki hâl, `draft` formdaki hâl;
 * ikisi farklıysa "Kaydet" açılır. Yalnız SettingsController yazar.
 * `error` yükleme hatası (ekranı kaplar); kaydet/dinle sonucu toast'la controller'da bildirilir.
 */
interface SettingsState {
  data: AdminTtsSettingsResponse | null;
  draft: TtsSettings | null;
  loading: boolean;
  saving: boolean;
  previewing: TtsProvider | null;
  preview: TtsPreview | null;
  error: string | null;
  setData: (d: AdminTtsSettingsResponse) => void;
  setDraft: (d: TtsSettings) => void;
  setLoading: (v: boolean) => void;
  setSaving: (v: boolean) => void;
  setPreviewing: (p: TtsProvider | null) => void;
  setPreview: (p: TtsPreview | null) => void;
  setError: (e: string | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  data: null,
  draft: null,
  loading: false,
  saving: false,
  previewing: null,
  preview: null,
  error: null,
  // Sunucudan gelen hâl formu da sıfırlar: kaydedilen = gösterilen
  setData: (data) => set({ data, draft: data.settings, error: null }),
  setDraft: (draft) => set({ draft }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setPreviewing: (previewing) => set({ previewing }),
  setPreview: (preview) => set({ preview }),
  setError: (error) => set({ error }),
}));

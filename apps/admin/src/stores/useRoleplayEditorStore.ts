import type { AdminRoleplayLint } from "@glotmate/contracts";
import { create } from "zustand";
import { emptySpecForm, type SpecForm } from "@/lib/roleplayDraft";

/** Editörün neyi düzenlediği — başlık bandı ve "kaydet ne yapar" metni bunu okur */
export type EditorSource =
  | { kind: "new" }
  | { kind: "draft"; revision: number }
  | { kind: "published"; revision: number }
  | { kind: "revision"; revision: number };

/** Sunucu kuru-koşu lint durumu; `forKey` raporun hangi spec için olduğunu söyler (bayatlık) */
export interface EditorLint {
  report: AdminRoleplayLint | null;
  forKey: string | null;
  checking: boolean;
  /** İstek hata verdiyse kodu (ağ vb.) — rapor değil */
  error: string | null;
}

/**
 * Roleplay editör taslağı. Yalnız RoleplayEditorController yazar. Store'da durur ki
 * sekme değişimi ve panel içi gezinme yazılanı kaybettirmesin; `key` taslağın hangi
 * senaryoya ait olduğunu söyler ("new" = /roleplays/new). `baseline` sunucudaki
 * hâlin aday anahtarı — kirli = `candidateKey(form) !== baseline`.
 */
interface RoleplayEditorState {
  key: string | null;
  source: EditorSource;
  form: SpecForm;
  baseline: string;
  /** Yalnız yeni senaryo: kalıcı kimlik + kullanıcı elle değiştirdi mi (başlıktan türetme durur) */
  slug: string;
  slugTouched: boolean;
  lint: EditorLint;
  saving: boolean;
  /** Oluşturma başarılı → rota dosyası bu kimliğe yönlendirir */
  createdId: string | null;
  reset: (p: { key: string; source: EditorSource; form: SpecForm; baseline: string }) => void;
  setForm: (form: SpecForm) => void;
  setBaseline: (baseline: string, source: EditorSource) => void;
  setSlug: (slug: string, touched: boolean) => void;
  setLint: (patch: Partial<EditorLint>) => void;
  setSaving: (v: boolean) => void;
  setCreatedId: (id: string | null) => void;
}

const NO_LINT: EditorLint = { report: null, forKey: null, checking: false, error: null };

export const useRoleplayEditorStore = create<RoleplayEditorState>((set) => ({
  key: null,
  source: { kind: "new" },
  form: emptySpecForm(),
  baseline: "",
  slug: "rp-",
  slugTouched: false,
  lint: NO_LINT,
  saving: false,
  createdId: null,
  reset: ({ key, source, form, baseline }) =>
    set({ key, source, form, baseline, lint: NO_LINT, saving: false, slug: "rp-", slugTouched: false }),
  setForm: (form) => set({ form }),
  setBaseline: (baseline, source) => set({ baseline, source }),
  setSlug: (slug, slugTouched) => set({ slug, slugTouched }),
  setLint: (patch) => set((s) => ({ lint: { ...s.lint, ...patch } })),
  setSaving: (saving) => set({ saving }),
  setCreatedId: (createdId) => set({ createdId }),
}));

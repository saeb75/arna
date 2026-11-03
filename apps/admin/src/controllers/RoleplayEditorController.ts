import type { AdminRoleplayDetail, AdminRoleplayLint } from "@glotmate/contracts";
import { toast } from "sonner";
import { errorCode, errorData } from "@/api";
import { RoleplayDetailController } from "@/controllers/RoleplayDetailController";
import { errorLabel } from "@/lib/labels";
import {
  ROLEPLAY_SLUG_RE,
  candidateKey,
  emptyComplication,
  emptyObjective,
  emptySpecForm,
  idFromLabel,
  moveItem,
  parseSpecForm,
  slugFromTitle,
  specKey,
  specToForm,
  type ComplicationForm,
  type ObjectiveForm,
  type SpecForm,
} from "@/lib/roleplayDraft";
import { AdminRoleplaysService } from "@/services/AdminRoleplaysService";
import { useRoleplayDetailStore } from "@/stores/useRoleplayDetailStore";
import { useRoleplayEditorStore, type EditorSource } from "@/stores/useRoleplayEditorStore";

/** Yazarken her tuşta istek atılmasın — kısa sessizlikten sonra tek kuru koşu */
const LINT_DEBOUNCE_MS = 450;
let lintTimer: ReturnType<typeof setTimeout> | null = null;
let lintSeq = 0;

const NEW_KEY = "new";

/** Editörün başlangıç noktası: açık taslak > yayın > en yeni revizyon */
function baseOf(detail: AdminRoleplayDetail): { form: SpecForm; source: EditorSource } | null {
  if (detail.draft) return { form: specToForm(detail.draft.spec), source: { kind: "draft", revision: detail.draft.revision } };
  const published = detail.revisions.find((r) => r.status === "published");
  if (published) return { form: specToForm(published.spec), source: { kind: "published", revision: published.revision } };
  const latest = detail.revisions[0];
  if (latest) return { form: specToForm(latest.spec), source: { kind: "revision", revision: latest.revision } };
  return null;
}

/** 422/400 gövdesinden rapor: `report` (kapı) ya da `issues` (şema) */
function reportOf(err: unknown): AdminRoleplayLint | null {
  const data = errorData(err);
  if (!data) return null;
  const report = data.report as AdminRoleplayLint | undefined;
  if (report && Array.isArray(report.errors)) return report;
  const issues = data.issues as Array<{ path?: unknown[]; message?: string }> | undefined;
  if (Array.isArray(issues)) {
    return { errors: issues.map((i) => `${(i.path ?? []).join(".") || "spec"}: ${i.message ?? "invalid"}`), warnings: [] };
  }
  return null;
}

/**
 * Roleplay editörü: Screen → RoleplayEditorController → AdminRoleplaysService → useRoleplayEditorStore.
 *
 * Form store'da; her değişiklik debounce'lu kuru-koşu lint'i tetikler (istemci şemasından
 * geçmeyen taslak sunucuya HİÇ gitmez). Kayıt PUT draft → detay döner → detay store'u
 * RoleplayDetailController üzerinden güncellenir (liste de tazelenir) ve editör kayıtlı
 * hâle eşitlenir. Sonuç bildirimi (toast) burada.
 */
export class RoleplayEditorController {
  // --- Kurulum ------------------------------------------------------------------

  /**
   * Detay geldi → editörü kur. Aynı senaryoda KİRLİ taslak korunur (yenileme yazılanı
   * silmez) — yalnız karşılaştırma tabanı güncellenir. `force` kayıt/atma/yayın sonrası.
   */
  static syncWithDetail(detail: AdminRoleplayDetail, opts: { force?: boolean } = {}): void {
    const store = useRoleplayEditorStore.getState();
    const id = detail.roleplay.id;
    const base = baseOf(detail);
    const form = base?.form ?? emptySpecForm();
    const source: EditorSource = base?.source ?? { kind: "new" };
    const baseline = candidateKey(form);
    const dirty = store.key === id && candidateKey(store.form) !== store.baseline;
    if (dirty && !opts.force) {
      store.setBaseline(baseline, source);
    } else {
      store.reset({ key: id, source, form, baseline });
    }
    this.scheduleLint(0);
  }

  /** /roleplays/new — önceki yarım kalmış yeni taslak korunur (panel içi gezinme kaybettirmez) */
  static initNew(): void {
    const store = useRoleplayEditorStore.getState();
    if (store.key !== NEW_KEY) {
      const form = emptySpecForm();
      store.reset({ key: NEW_KEY, source: { kind: "new" }, form, baseline: candidateKey(form) });
    }
    this.scheduleLint(0);
  }

  /** Kaydedilmemiş değişiklikleri at — kayıtlı hâle (ya da boş şablona) dön */
  static discardLocal(): void {
    const store = useRoleplayEditorStore.getState();
    const detail = useRoleplayDetailStore.getState().detail;
    if (store.key && store.key !== NEW_KEY && detail?.roleplay.id === store.key) {
      this.syncWithDetail(detail, { force: true });
      return;
    }
    const form = emptySpecForm();
    store.reset({ key: NEW_KEY, source: { kind: "new" }, form, baseline: candidateKey(form) });
  }

  static clearCreated(): void {
    if (useRoleplayEditorStore.getState().createdId) useRoleplayEditorStore.getState().setCreatedId(null);
  }

  // --- Form düzenleme -----------------------------------------------------------

  private static update(next: SpecForm): void {
    const store = useRoleplayEditorStore.getState();
    store.setForm(next);
    // Yeni senaryoda slug, operatör elle dokunana kadar başlıktan türer
    if (store.key === NEW_KEY && !store.slugTouched) store.setSlug(slugFromTitle(next.title), false);
    this.scheduleLint();
  }

  static setField<K extends Exclude<keyof SpecForm, "persona" | "objectives" | "complications">>(key: K, value: SpecForm[K]): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({ ...form, [key]: value });
  }

  static setPersona(patch: Partial<SpecForm["persona"]>): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({ ...form, persona: { ...form.persona, ...patch } });
  }

  static addObjective(): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({ ...form, objectives: [...form.objectives, emptyObjective(form.supportedFrom)] });
  }

  /** Etiket değişince, kimliği hâlâ türetilen (yeni) öğenin kimliği de güncellenir; kimliği elle yazmak türetmeyi keser */
  static updateObjective(index: number, patch: Partial<Omit<ObjectiveForm, "key" | "idAuto">>): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({
      ...form,
      objectives: form.objectives.map((o, i) => {
        if (i !== index) return o;
        if (patch.id !== undefined) return { ...o, ...patch, idAuto: false };
        if (patch.label !== undefined && o.idAuto) return { ...o, ...patch, id: idFromLabel(patch.label) };
        return { ...o, ...patch };
      }),
    });
  }

  static removeObjective(index: number): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({ ...form, objectives: form.objectives.filter((_, i) => i !== index) });
  }

  static moveObjective(index: number, delta: -1 | 1): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({ ...form, objectives: moveItem(form.objectives, index, index + delta) });
  }

  static addComplication(): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({ ...form, complications: [...form.complications, emptyComplication()] });
  }

  static updateComplication(index: number, patch: Partial<Omit<ComplicationForm, "key" | "idAuto">>): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({
      ...form,
      complications: form.complications.map((c, i) => {
        if (i !== index) return c;
        if (patch.id !== undefined) return { ...c, ...patch, idAuto: false };
        if (patch.text !== undefined && c.idAuto) return { ...c, ...patch, id: idFromLabel(patch.text) };
        return { ...c, ...patch };
      }),
    });
  }

  static removeComplication(index: number): void {
    const { form } = useRoleplayEditorStore.getState();
    this.update({ ...form, complications: form.complications.filter((_, i) => i !== index) });
  }

  static setSlug(slug: string): void {
    useRoleplayEditorStore.getState().setSlug(slug.trim().toLowerCase(), true);
  }

  /** Elle yazılan slug'ı bırak, yeniden başlıktan türet */
  static deriveSlugFromTitle(): void {
    const store = useRoleplayEditorStore.getState();
    store.setSlug(slugFromTitle(store.form.title), false);
  }

  // --- Sunucu kuru koşu ---------------------------------------------------------

  static scheduleLint(delay = LINT_DEBOUNCE_MS): void {
    if (lintTimer) clearTimeout(lintTimer);
    lintTimer = setTimeout(() => void this.runLint(), delay);
  }

  /** İstemci kapısından geçen taslağı sunucu lint'inden geçirir; bayat cevap sıra numarasıyla elenir */
  static async runLint(): Promise<void> {
    const store = useRoleplayEditorStore.getState();
    const parsed = parseSpecForm(store.form);
    if (!parsed.ok) {
      lintSeq++; // uçuştaki cevap artık bu forma ait değil
      if (store.lint.checking) store.setLint({ checking: false });
      return;
    }
    const key = specKey(parsed.spec);
    if (store.lint.forKey === key && store.lint.report && !store.lint.error) return;
    const seq = ++lintSeq;
    store.setLint({ checking: true, error: null });
    try {
      const report = await AdminRoleplaysService.lint(parsed.spec);
      if (seq !== lintSeq) return;
      useRoleplayEditorStore.getState().setLint({ report, forKey: key, checking: false, error: null });
    } catch (err) {
      if (seq !== lintSeq) return;
      useRoleplayEditorStore.getState().setLint({ report: reportOf(err), forKey: key, checking: false, error: errorCode(err) });
    }
  }

  // --- Kayıt --------------------------------------------------------------------

  /** PUT draft: açık taslağı günceller ya da yayından yeni taslak revizyonu doğurur */
  static async saveDraft(id: string): Promise<void> {
    const store = useRoleplayEditorStore.getState();
    const parsed = parseSpecForm(store.form);
    if (!parsed.ok) {
      toast.error(errorLabel("invalid_form"));
      return;
    }
    if (store.saving) return;
    store.setSaving(true);
    try {
      const detail = await AdminRoleplaysService.saveDraft(id, parsed.spec);
      RoleplayDetailController.applyDetail(detail);
      this.syncWithDetail(detail, { force: true });
      toast.success(`Draft r${detail.draft?.revision ?? "?"} saved — publish it to go live.`);
    } catch (err) {
      const report = reportOf(err);
      if (report) useRoleplayEditorStore.getState().setLint({ report, forKey: specKey(parsed.spec), checking: false });
      toast.error(errorLabel(errorCode(err)));
    } finally {
      useRoleplayEditorStore.getState().setSaving(false);
    }
  }

  /** POST: yeni kimlik + revizyon 1 taslak. Başarıda `createdId` → rota dosyası detaya yönlendirir */
  static async create(): Promise<void> {
    const store = useRoleplayEditorStore.getState();
    if (!ROLEPLAY_SLUG_RE.test(store.slug)) {
      toast.error(errorLabel("invalid_slug"));
      return;
    }
    const parsed = parseSpecForm(store.form);
    if (!parsed.ok) {
      toast.error(errorLabel("invalid_form"));
      return;
    }
    if (store.saving) return;
    store.setSaving(true);
    try {
      const detail = await AdminRoleplaysService.create(store.slug, parsed.spec);
      RoleplayDetailController.applyDetail(detail);
      this.syncWithDetail(detail, { force: true });
      useRoleplayEditorStore.getState().setCreatedId(detail.roleplay.id);
      toast.success(`Created ${detail.roleplay.id} — draft r1 is ready to review and publish.`);
    } catch (err) {
      const report = reportOf(err);
      if (report) useRoleplayEditorStore.getState().setLint({ report, forKey: specKey(parsed.spec), checking: false });
      toast.error(errorLabel(errorCode(err)));
    } finally {
      useRoleplayEditorStore.getState().setSaving(false);
    }
  }
}

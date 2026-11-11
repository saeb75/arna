import type { TtsProvider } from "@glotmate/contracts";
import { toast } from "sonner";
import { errorCode } from "@/api";
import { errorLabel, PROVIDER_LABEL, tutorErrorLabel } from "@/lib/labels";
import {
  emptyTutorForm,
  formFromTutor,
  formKey,
  isValidTutorName,
  validateTutorForm,
  withName,
  withProvider,
  type TutorForm,
} from "@/lib/tutorDraft";
import { AdminSettingsService } from "@/services/AdminSettingsService";
import { AdminTutorsService } from "@/services/AdminTutorsService";
import { useTutorsStore, type TutorEditor } from "@/stores/useTutorsStore";

/**
 * Öğretmenler: Screen → TutorsController → AdminTutorsService (+ AdminSettingsService:
 * ses seçenekleri ve önizleme) → useTutorsStore.
 * Form düzenlemeleri `editor.form`a yazılır; sunucuya yalnız `save()` gider.
 * Sonuç bildirimi (toast) TEK yerde, burada.
 */
export class TutorsController {
  static async load(): Promise<void> {
    const store = useTutorsStore.getState();
    store.setLoading(true);
    try {
      const [list, tts] = await Promise.all([AdminTutorsService.fetchList(), AdminSettingsService.fetchTts()]);
      store.setData(list, tts);
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }

  static openCreate(): void {
    const store = useTutorsStore.getState();
    const { data, tts } = store;
    if (!data || !tts) return;
    const form = emptyTutorForm(
      data.tutors,
      data.avatars.map((a) => a.id),
      tts,
    );
    TutorsController.open({ mode: "create", originalId: null, form, baseline: formKey(form), attempted: false });
  }

  static openEdit(id: string): void {
    const tutor = useTutorsStore.getState().data?.tutors.find((t) => t.id === id);
    if (!tutor) return;
    const form = formFromTutor(tutor);
    TutorsController.open({ mode: "edit", originalId: id, form, baseline: formKey(form), attempted: false });
  }

  private static open(editor: TutorEditor): void {
    const store = useTutorsStore.getState();
    store.setSample(null);
    store.setEditor(editor);
    store.setEditorOpen(true);
  }

  /** Diyaloğu kapatır; form kapanış animasyonu bitene kadar store'da kalır (bir sonraki açılış ezer) */
  static close(): void {
    const store = useTutorsStore.getState();
    if (store.saving) return;
    store.setEditorOpen(false);
    store.setSample(null);
  }

  static setField(patch: Partial<Omit<TutorForm, "name" | "id" | "idAuto" | "provider">>): void {
    TutorsController.update((form) => ({ ...form, ...patch }));
  }

  static setName(name: string): void {
    const mode = useTutorsStore.getState().editor?.mode ?? "edit";
    TutorsController.update((form) => withName(form, name, mode));
  }

  /** Kimliği elle yazmak addan türetmeyi durdurur */
  static setId(id: string): void {
    TutorsController.update((form) => ({ ...form, id: id.toLowerCase(), idAuto: false }));
  }

  static setProvider(provider: TtsProvider): void {
    const tts = useTutorsStore.getState().tts;
    if (!tts) return;
    TutorsController.update((form) => withProvider(form, tts, provider));
  }

  private static update(fn: (form: TutorForm) => TutorForm): void {
    const store = useTutorsStore.getState();
    if (!store.editor) return;
    store.setEditor({ ...store.editor, form: fn(store.editor.form) });
  }

  static async save(): Promise<void> {
    const store = useTutorsStore.getState();
    const { editor, data, tts } = store;
    if (!editor || !data || !tts || store.saving) return;
    const { body } = validateTutorForm(editor.form, {
      mode: editor.mode,
      tts,
      tutors: data.tutors,
      avatarIds: data.avatars.map((a) => a.id),
      originalId: editor.originalId,
    });
    if (!body) {
      store.setEditor({ ...editor, attempted: true });
      toast.error(errorLabel("invalid_form"));
      return;
    }

    store.setSaving(true);
    try {
      const list =
        editor.mode === "create"
          ? await AdminTutorsService.create({ ...body, id: editor.form.id })
          : await AdminTutorsService.update(editor.originalId ?? editor.form.id, body);
      store.setList(list);
      store.setEditorOpen(false);
      store.setSample(null);
      toast.success(`${editor.mode === "create" ? "Created" : "Saved"} · ${body.name}`);
    } catch (err) {
      toast.error(tutorErrorLabel(errorCode(err)));
    } finally {
      store.setSaving(false);
    }
  }

  /**
   * Ses örneği: kullanıcının duyacağı tanıtım cümlesini sunucudan alır (formdaki adla),
   * formdaki ses/modelle kaydetmeden seslendirir. Klipleri çalmak ekranın işi (`ClipPlayer`).
   */
  static async playSample(): Promise<void> {
    const store = useTutorsStore.getState();
    const { editor, tts } = store;
    if (!editor || !tts || store.sampling) return;
    const { form } = editor;
    const voiceId = form.voiceId.trim();
    if (!tts.configured[form.provider]) {
      toast.error(errorLabel("provider_not_configured"));
      return;
    }
    if (!voiceId) {
      toast.error("Enter a voice first.");
      return;
    }
    if (!isValidTutorName(form.name)) {
      toast.error("Enter a valid name first — the sample introduces the tutor by name.");
      return;
    }

    store.setSampling(true);
    try {
      const text = await AdminTutorsService.fetchSampleLine(form.name.trim());
      const res = await AdminSettingsService.previewTts({
        provider: form.provider,
        voiceId,
        modelId: form.modelId,
        text,
        language: "en",
      });
      store.setSample({ ...res, text, at: Date.now() });
    } catch (err) {
      toast.error(`${PROVIDER_LABEL[form.provider]}: ${errorLabel(errorCode(err))}`);
    } finally {
      store.setSampling(false);
    }
  }
}

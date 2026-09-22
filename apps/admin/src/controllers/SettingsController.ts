import type { TtsProvider, TtsProviderConfig } from "@glotmate/contracts";
import { toast } from "sonner";
import { errorCode } from "@/api";
import { errorLabel, PROVIDER_LABEL } from "@/lib/labels";
import { AdminSettingsService } from "@/services/AdminSettingsService";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Tutor sesi ayarları: Screen → SettingsController → AdminSettingsService → useSettingsStore.
 * LessonsController şablonu: setLoading → try service → store.set → catch setError(errorCode) → finally.
 * Form düzenlemeleri `draft`a yazılır; sunucuya yalnız `save()` gider.
 * Sonuç bildirimi (toast) TEK yerde, burada (admin CLAUDE.md: aksiyonlar).
 */
export class SettingsController {
  static async load(): Promise<void> {
    const store = useSettingsStore.getState();
    store.setLoading(true);
    try {
      store.setData(await AdminSettingsService.fetchTts());
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }

  static setProvider(provider: TtsProvider): void {
    const store = useSettingsStore.getState();
    if (!store.draft) return;
    store.setDraft({ ...store.draft, provider });
  }

  static setProviderConfig(provider: TtsProvider, patch: Partial<TtsProviderConfig>): void {
    const store = useSettingsStore.getState();
    if (!store.draft) return;
    store.setDraft({ ...store.draft, [provider]: { ...store.draft[provider], ...patch } });
  }

  static resetDraft(): void {
    const store = useSettingsStore.getState();
    if (store.data) store.setDraft(store.data.settings);
  }

  /** Taslağın tamamını gönderir; başarıda sunucu hâli hem `data` hem `draft` olur. */
  static async save(): Promise<void> {
    const store = useSettingsStore.getState();
    const draft = store.draft;
    if (!draft) return;
    store.setSaving(true);
    try {
      const data = await AdminSettingsService.saveTts(draft);
      store.setData(data);
      toast.success(`Saved · active: ${PROVIDER_LABEL[data.settings.provider]}`);
    } catch (err) {
      toast.error(errorLabel(errorCode(err)));
    } finally {
      store.setSaving(false);
    }
  }

  /**
   * Kaydetmeden dinle — taslaktaki ses/modelle. `voiceId` boşsa .env
   * varsayılanı denenir; o da yoksa sunucu 400 döner, burada ön elenir.
   * Sesi çalmak ekranın işi (DOM); burası yalnız store'a klip yazar.
   */
  static async preview(provider: TtsProvider, text: string): Promise<void> {
    const store = useSettingsStore.getState();
    const { draft, data } = store;
    if (!draft || !data) return;
    const voiceId = draft[provider].voiceId ?? data.defaultVoiceId[provider];
    if (!voiceId) {
      toast.error(errorLabel("voice_missing"));
      return;
    }
    store.setPreviewing(provider);
    try {
      const res = await AdminSettingsService.previewTts({
        provider,
        voiceId,
        modelId: draft[provider].modelId,
        text,
        language: "en",
      });
      store.setPreview({ ...res, provider, at: Date.now() });
      toast.success(
        `${PROVIDER_LABEL[provider]} · ${res.latencyMs} ms${res.hasAlignment ? " · lip-sync timestamps" : " · NO timestamps"}`,
      );
    } catch (err) {
      toast.error(errorLabel(errorCode(err)));
    } finally {
      store.setPreviewing(null);
    }
  }
}

import type { AdminTtsPreviewBody, AvatarId, TtsProvider, TtsProviderConfig } from "@glotmate/contracts";
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
      const [tts, avatar] = await Promise.all([
        AdminSettingsService.fetchTts(),
        AdminSettingsService.fetchAvatar(),
      ]);
      store.setData(tts);
      store.setAvatarData(avatar);
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }

  static setAvatar(activeId: AvatarId): void {
    const store = useSettingsStore.getState();
    store.setAvatarDraft({ activeId });
  }

  static resetAvatarDraft(): void {
    const store = useSettingsStore.getState();
    if (store.avatarData) store.setAvatarDraft(store.avatarData.settings);
  }

  static async saveAvatar(): Promise<void> {
    const store = useSettingsStore.getState();
    const draft = store.avatarDraft;
    if (!draft) return;
    store.setAvatarSaving(true);
    try {
      const data = await AdminSettingsService.saveAvatar(draft);
      store.setAvatarData(data);
      const label = data.avatars.find((a) => a.id === data.settings.activeId)?.label ?? data.settings.activeId;
      toast.success(`Saved · active avatar: ${label}`);
    } catch (err) {
      toast.error(errorLabel(errorCode(err)));
    } finally {
      store.setAvatarSaving(false);
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
   * Kaydetmeden dinle — taslaktaki ses/modelle, ders akışını taklit eden parçalarla
   * (opsiyonel ana dil cümlesi + İngilizce cümle). `voiceId` boşsa .env varsayılanı
   * denenir; o da yoksa sunucu 400 döner, burada ön elenir.
   * Klipleri çalmak ekranın işi (DOM); burası yalnız store'a yazar ve bildirir.
   */
  static async preview(
    provider: TtsProvider,
    input: { text: string; l1Text: string; l1Language: string },
  ): Promise<void> {
    const store = useSettingsStore.getState();
    const { draft, data } = store;
    if (!draft || !data) return;
    const voiceId = draft[provider].voiceId ?? data.defaultVoiceId[provider];
    if (!voiceId) {
      toast.error(errorLabel("voice_missing"));
      return;
    }
    const runs: AdminTtsPreviewBody["runs"] = [];
    if (input.l1Text.trim()) runs.push({ language: input.l1Language.trim() || "tr", text: input.l1Text.trim() });
    runs.push({ language: "en", text: input.text.trim() });

    store.setPreviewing(provider);
    try {
      const res = await AdminSettingsService.previewTts({
        provider,
        voiceId,
        modelId: draft[provider].modelId,
        text: input.text.trim(),
        language: "en",
        runs,
      });
      store.setPreview({ ...res, provider, at: Date.now() });
      const aligned = res.clips.every((c) => c.hasAlignment);
      toast.success(
        `${PROVIDER_LABEL[provider]} · ${res.latencyMs} ms · ${res.clips.length} clip${res.clips.length === 1 ? "" : "s"}${aligned ? " · lip-sync timestamps" : " · NO timestamps"}`,
      );
    } catch (err) {
      toast.error(errorLabel(errorCode(err)));
    } finally {
      store.setPreviewing(null);
    }
  }
}

"use client";

import { TTS_PROVIDERS, type TtsProvider } from "@glotmate/contracts";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsController } from "@/controllers/SettingsController";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { SettingsSkeleton } from "@/screens/settings/SettingsSkeleton";
import { TtsActiveProviderCard } from "@/screens/settings/TtsActiveProviderCard";
import { TtsProviderForm } from "@/screens/settings/TtsProviderForm";

const DEFAULT_PREVIEW_TEXT = "What have you been doing lately?";
const DEFAULT_PREVIEW_L1_LANGUAGE = "tr";

/**
 * Ayarlar ekranı — şimdilik tek bölüm: tutor sesi. Skeleton YALNIZ veri yokken.
 * Toast'lar controller'da; ekranın tek DOM yan etkisi önizleme kliplerini
 * SIRAYLA çalmak (ders istemcisiyle aynı: klip zinciri). Store'daki `preview`
 * değişince tetiklenir; `at` damgası aynı sağlayıcıyı ikinci kez dinlemeyi yakalar.
 *
 * Önizleme ders akışını taklit eder: ana dilde giriş cümlesi (opsiyonel) +
 * İngilizce hedef cümle → çok dilli tek klip yeteneği üç sağlayıcıda kıyaslanır.
 */
export function SettingsScreen() {
  const { data, draft, loading, error, preview } = useSettingsStore();
  const [previewText, setPreviewText] = useState(DEFAULT_PREVIEW_TEXT);
  const [previewL1Text, setPreviewL1Text] = useState("");
  const [previewL1Language, setPreviewL1Language] = useState(DEFAULT_PREVIEW_L1_LANGUAGE);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    void SettingsController.load();
  }, []);

  useEffect(() => {
    if (!preview) return;
    audioRef.current?.pause();
    let index = 0;
    const playNext = () => {
      const clip = preview.clips[index++];
      if (!clip) return;
      const audio = new Audio(`data:audio/mpeg;base64,${clip.audioBase64}`);
      audioRef.current = audio;
      audio.onended = playNext;
      audio.onerror = playNext;
      void audio.play().catch(() => undefined); // otomatik çalma engeli: toast zaten sonucu söyledi
    };
    playNext();
  }, [preview]);

  const dirty = useMemo(
    () => Boolean(data && draft && JSON.stringify(draft) !== JSON.stringify(data.settings)),
    [data, draft],
  );

  const refresh = (
    <Button variant="outline" size="sm" onClick={() => void SettingsController.load()} disabled={loading}>
      <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
      Refresh
    </Button>
  );

  const onPreview = (provider: TtsProvider) =>
    void SettingsController.preview(provider, {
      text: previewText,
      l1Text: previewL1Text,
      l1Language: previewL1Language,
    });

  return (
    <>
      <PageHeader
        title="Settings"
        description="Runtime settings — stored on the server, no deploy needed. API keys live in .env, not here."
        actions={refresh}
      />

      {error && !data ? (
        <ErrorState code={error} onRetry={() => void SettingsController.load()} />
      ) : !data ? (
        <SettingsSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <TtsActiveProviderCard dirty={dirty} onSave={() => void SettingsController.save()} />

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_7rem]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="preview-text">Preview · English sentence</Label>
              <Input
                id="preview-text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value.slice(0, 300))}
                placeholder={DEFAULT_PREVIEW_TEXT}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="preview-l1">Native-language sentence (optional)</Label>
              <Input
                id="preview-l1"
                value={previewL1Text}
                onChange={(e) => setPreviewL1Text(e.target.value.slice(0, 300))}
                placeholder="Spoken before the English sentence — tests mixed-language output"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="preview-lang">Language</Label>
              <Input
                id="preview-lang"
                value={previewL1Language}
                onChange={(e) => setPreviewL1Language(e.target.value.trim().slice(0, 12))}
                placeholder="tr"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
          <p className="-mt-2 text-[11px] text-muted-foreground">
            &quot;Preview&quot; synthesizes with the draft voice/model without saving (cache bypassed). With a native-language
            sentence, providers that support single-clip mixed languages return one clip; the others return one clip per language.
          </p>

          <div className="grid gap-4 lg:grid-cols-3">
            {TTS_PROVIDERS.map((p) => (
              <TtsProviderForm key={p} provider={p} previewText={previewText} onPreview={onPreview} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

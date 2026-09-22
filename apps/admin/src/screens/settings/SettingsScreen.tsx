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

const DEFAULT_PREVIEW_TEXT = "Hello! I'm Emma, your English teacher. Shall we begin today's lesson?";

/**
 * Ayarlar ekranı — şimdilik tek bölüm: tutor sesi. Skeleton YALNIZ veri yokken.
 * Toast'lar controller'da; ekranın tek DOM yan etkisi önizleme sesini çalmak:
 * store'daki `preview` değişince (aynı sağlayıcıyı ikinci kez dinlemede `at`
 * damgası effect'i yeniden tetikler).
 */
export function SettingsScreen() {
  const { data, draft, loading, error, preview } = useSettingsStore();
  const [previewText, setPreviewText] = useState(DEFAULT_PREVIEW_TEXT);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    void SettingsController.load();
  }, []);

  useEffect(() => {
    if (!preview) return;
    audioRef.current?.pause();
    const audio = new Audio(`data:audio/mpeg;base64,${preview.audioBase64}`);
    audioRef.current = audio;
    void audio.play().catch(() => undefined); // otomatik çalma engeli: toast zaten sonucu söyledi
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preview-text">Preview sentence</Label>
            <Input
              id="preview-text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value.slice(0, 300))}
              placeholder={DEFAULT_PREVIEW_TEXT}
            />
            <p className="text-[11px] text-muted-foreground">
              &quot;Preview&quot; synthesizes this sentence with the draft voice/model without saving (English; cache bypassed).
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {TTS_PROVIDERS.map((p) => (
              <TtsProviderForm
                key={p}
                provider={p}
                previewText={previewText}
                onPreview={(prov: TtsProvider) => void SettingsController.preview(prov, previewText)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

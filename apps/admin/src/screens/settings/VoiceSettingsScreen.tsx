"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsController } from "@/controllers/SettingsController";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { SettingsSkeleton } from "@/screens/settings/SettingsSkeleton";
import { TtsActiveProviderCard } from "@/screens/settings/TtsActiveProviderCard";
import { TtsProviderList } from "@/screens/settings/TtsProviderList";

/**
 * Ses ayarları — kendi sayfası: aktif sağlayıcı + sağlayıcı listesi. Ses/model
 * formu ve önizleme her sağlayıcının kendi sayfasında (`/settings/voice/[provider]`).
 */
export function VoiceSettingsScreen() {
  const { data, draft, loading, error } = useSettingsStore();

  useEffect(() => {
    void SettingsController.load();
  }, []);

  const dirty = useMemo(
    () => Boolean(data && draft && JSON.stringify(draft) !== JSON.stringify(data.settings)),
    [data, draft],
  );

  return (
    <>
      <PageHeader
        title="Voice"
        description="Which provider synthesizes the tutor's speech. API keys live in .env, not here."
        actions={
          <Button variant="outline" size="sm" onClick={() => void SettingsController.load()} disabled={loading}>
            <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
            Refresh
          </Button>
        }
      />
      {error && !data ? (
        <ErrorState code={error} onRetry={() => void SettingsController.load()} />
      ) : !data ? (
        <SettingsSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <TtsActiveProviderCard dirty={dirty} onSave={() => void SettingsController.save()} />
          <TtsProviderList />
        </div>
      )}
    </>
  );
}

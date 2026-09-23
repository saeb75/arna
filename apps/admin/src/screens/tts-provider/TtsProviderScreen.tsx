"use client";

import type { TtsProvider } from "@glotmate/contracts";
import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { SettingsController } from "@/controllers/SettingsController";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { SettingsSkeleton } from "@/screens/settings/SettingsSkeleton";
import { TtsPreviewPanel } from "@/screens/tts-provider/TtsPreviewPanel";
import { TtsProviderForm } from "@/screens/tts-provider/TtsProviderForm";
import { TtsProviderHeader } from "@/screens/tts-provider/TtsProviderHeader";

/**
 * Tek sağlayıcının sayfası: başlık (rozet + aksiyon), ses/model formu, önizleme.
 * Store genel bakışla ortaktır — burada yapılan düzenleme listede "Unsaved edits"
 * olarak görünür; veri yoksa (doğrudan URL ile gelindi) yüklenir.
 */
export function TtsProviderScreen({ provider }: { provider: TtsProvider }) {
  const { data, error } = useSettingsStore();

  useEffect(() => {
    if (!useSettingsStore.getState().data) void SettingsController.load();
  }, []);

  if (error && !data) return <ErrorState code={error} onRetry={() => void SettingsController.load()} />;
  if (!data) return <SettingsSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <TtsProviderHeader provider={provider} />
      <TtsProviderForm provider={provider} />
      <TtsPreviewPanel provider={provider} />
    </div>
  );
}

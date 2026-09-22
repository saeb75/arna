"use client";

import { TTS_PROVIDERS, type TtsProvider } from "@glotmate/contracts";
import { Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsController } from "@/controllers/SettingsController";
import { formatDateTime, PROVIDER_LABEL } from "@/lib/labels";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Aktif sağlayıcı seçimi + kaydet. Anahtarı .env'de olmayan sağlayıcı
 * listede görünür ama seçilemez (operatör neyin eksik olduğunu görür).
 * "Kaydet" yalnız taslak sunucudan farklıysa açılır.
 */
export function TtsActiveProviderCard({ dirty, onSave }: { dirty: boolean; onSave: () => void }) {
  const data = useSettingsStore((s) => s.data);
  const draft = useSettingsStore((s) => s.draft);
  const saving = useSettingsStore((s) => s.saving);
  if (!data || !draft) return null;

  const items = TTS_PROVIDERS.map((p) => ({
    value: p,
    label: data.configured[p] ? PROVIDER_LABEL[p] : `${PROVIDER_LABEL[p]} · no API key`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor voice</CardTitle>
        <CardDescription>
          Which provider synthesizes Emma&apos;s speech. Changes apply to new turns as soon as they are saved; open
          lessons are not interrupted.
          {data.updatedAt ? ` Last saved ${formatDateTime(data.updatedAt)}.` : " Not saved yet — using the .env default."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tts-provider">Active provider</Label>
          <Select
            value={draft.provider}
            onValueChange={(v) => SettingsController.setProvider(v as TtsProvider)}
            items={items}
          >
            <SelectTrigger id="tts-provider" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TTS_PROVIDERS.map((p) => (
                <SelectItem key={p} value={p} disabled={!data.configured[p]}>
                  {data.configured[p] ? PROVIDER_LABEL[p] : `${PROVIDER_LABEL[p]} · no API key`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          <Button variant="outline" size="sm" onClick={() => SettingsController.resetDraft()} disabled={!dirty || saving}>
            <Undo2 data-icon="inline-start" />
            Undo
          </Button>
          <Button size="sm" onClick={onSave} disabled={!dirty || saving}>
            <Save data-icon="inline-start" className={saving ? "animate-pulse" : undefined} />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

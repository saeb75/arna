"use client";

import type { TtsProvider } from "@glotmate/contracts";
import { KeyRound, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsController } from "@/controllers/SettingsController";
import { PROVIDER_LABEL } from "@/lib/labels";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Tek sağlayıcının ses/model formu + "Dinle". Ses kimliği boş bırakılırsa
 * .env varsayılanı kullanılır; ipucu bunu gösterir. Anahtarı olmayan
 * sağlayıcının formu düzenlenebilir (ileride anahtar gelince hazır) ama
 * dinlenemez ve aktif yapılamaz.
 */
export function TtsProviderForm({
  provider,
  previewText,
  onPreview,
}: {
  provider: TtsProvider;
  previewText: string;
  onPreview: (provider: TtsProvider) => void;
}) {
  const data = useSettingsStore((s) => s.data);
  const draft = useSettingsStore((s) => s.draft);
  const previewing = useSettingsStore((s) => s.previewing);
  if (!data || !draft) return null;

  const cfg = draft[provider];
  const configured = data.configured[provider];
  const defaultVoice = data.defaultVoiceId[provider];
  /** "Aktif" SUNUCUDAKİ hâldir; taslakta seçilmiş ama kaydedilmemişse ayrı rozet — karışmasın */
  const active = data.settings.provider === provider;
  const selected = draft.provider === provider;
  const models = data.models[provider];
  const canPreview = configured && Boolean(cfg.voiceId ?? defaultVoice) && previewText.trim().length > 0;

  return (
    <Card className={selected ? "ring-primary/40" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {PROVIDER_LABEL[provider]}
          {active && <Badge>Active</Badge>}
          {selected && !active && <Badge variant="outline">Selected · not saved</Badge>}
          {!configured && (
            <Badge variant="outline">
              <KeyRound data-icon="inline-start" />
              No API key in .env
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {provider === "elevenlabs"
            ? "with-timestamps endpoint; ~32 languages. Character timing already in the client format."
            : "Realtime TTS-2; 200+ languages. CHARACTER timestamps are converted to the client format on the server."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${provider}-model`}>Model</Label>
          <Select
            value={cfg.modelId}
            onValueChange={(v) => SettingsController.setProviderConfig(provider, { modelId: v as string })}
            items={models.map((m) => ({ value: m, label: m }))}
          >
            <SelectTrigger id={`${provider}-model`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${provider}-voice`}>Voice ID</Label>
          <Input
            id={`${provider}-voice`}
            value={cfg.voiceId ?? ""}
            placeholder={defaultVoice ?? (provider === "inworld" ? "Ashley" : "21m00Tcm4TlvDq8ikWAM")}
            onChange={(e) => {
              const v = e.target.value;
              SettingsController.setProviderConfig(provider, { voiceId: v.trim() === "" ? null : v });
            }}
            spellCheck={false}
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            {cfg.voiceId
              ? "Using the panel value."
              : defaultVoice
                ? `Empty — using the .env default: ${defaultVoice}`
                : "Empty and no .env default — this provider cannot be activated."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(provider)}
            disabled={!canPreview || previewing !== null}
          >
            <Play data-icon="inline-start" className={previewing === provider ? "animate-pulse" : undefined} />
            {previewing === provider ? "Synthesizing…" : "Preview"}
          </Button>
          {!selected && (
            <Button variant="ghost" size="sm" onClick={() => SettingsController.setProvider(provider)} disabled={!configured}>
              Select (then Save)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

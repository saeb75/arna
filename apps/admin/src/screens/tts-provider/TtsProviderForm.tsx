"use client";

import type { TtsProvider } from "@glotmate/contracts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsController } from "@/controllers/SettingsController";
import { useSettingsStore } from "@/stores/useSettingsStore";

const VOICE_PLACEHOLDER: Record<TtsProvider, string> = {
  elevenlabs: "21m00Tcm4TlvDq8ikWAM",
  inworld: "Ashley",
  azure: "en-US-AvaMultilingualNeural",
};

/**
 * Sağlayıcının ses/model alanları — yalnız form. Rozetler başlıkta, önizleme
 * kendi panelinde, kaydet/aktif yap başlıkta. Ses kimliği boşsa .env varsayılanı
 * kullanılır; ipucu bunu gösterir. Tek modelli sağlayıcıda model alanı gizlenir.
 */
export function TtsProviderForm({ provider }: { provider: TtsProvider }) {
  const data = useSettingsStore((s) => s.data);
  const draft = useSettingsStore((s) => s.draft);
  if (!data || !draft) return null;

  const cfg = draft[provider];
  const defaultVoice = data.defaultVoiceId[provider];
  const models = data.models[provider];

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">Voice &amp; model</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${provider}-voice`}>{provider === "azure" ? "Voice name" : "Voice ID"}</Label>
          <Input
            id={`${provider}-voice`}
            value={cfg.voiceId ?? ""}
            placeholder={defaultVoice ?? VOICE_PLACEHOLDER[provider]}
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

        {models.length > 1 && (
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
            <p className="text-[11px] text-muted-foreground">Allowed models come from the server list.</p>
          </div>
        )}
      </div>
    </section>
  );
}

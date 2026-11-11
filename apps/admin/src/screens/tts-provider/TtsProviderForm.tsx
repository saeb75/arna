"use client";

import type { TtsProvider } from "@glotmate/contracts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsController } from "@/controllers/SettingsController";
import { VOICE_PLACEHOLDER } from "@/lib/labels";
import { useSettingsStore } from "@/stores/useSettingsStore";

/** Katalogdaki "varsayılanı kullan" seçeneği — Select null değer taşıyamaz */
const DEFAULT_VOICE = "__default__";

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
  const catalog = data.voices[provider];

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">Voice &amp; model</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${provider}-voice`}>{provider === "azure" || catalog ? "Voice name" : "Voice ID"}</Label>
          {catalog ? (
            <Select
              value={cfg.voiceId ?? DEFAULT_VOICE}
              onValueChange={(v) =>
                SettingsController.setProviderConfig(provider, { voiceId: v === DEFAULT_VOICE ? null : (v as string) })
              }
              items={[
                { value: DEFAULT_VOICE, label: `.env default${defaultVoice ? ` (${defaultVoice})` : ""}` },
                ...catalog.map((v) => ({ value: v.id, label: `${v.id} · ${v.hint}` })),
              ]}
            >
              <SelectTrigger id={`${provider}-voice`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_VOICE}>.env default{defaultVoice ? ` (${defaultVoice})` : ""}</SelectItem>
                {catalog.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.id} · {v.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
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
          )}
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

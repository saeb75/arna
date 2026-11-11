"use client";

import { TTS_PROVIDERS, type TtsProvider } from "@glotmate/contracts";
import { FormField } from "@/components/shared/roleplay/FormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TutorsController } from "@/controllers/TutorsController";
import { PROVIDER_LABEL, VOICE_PLACEHOLDER } from "@/lib/labels";
import { TUTOR_LIMITS, type TutorIssues } from "@/lib/tutorDraft";
import { useTutorsStore } from "@/stores/useTutorsStore";
import { TutorSampleRow } from "@/screens/tutors/TutorSampleRow";

/**
 * Öğretmenin KENDİ sesi: sağlayıcı + ses + model. Seçenekler TTS ayar ucundan gelir
 * (anahtarı olmayan sağlayıcı görünür ama seçilemez; katalogsuz sağlayıcıda ses kimliği
 * serbest metin; tek modelli sağlayıcıda model alanı gizli — TTS ayar ekranıyla aynı).
 * Global TTS ayarından farklı olarak "boş = .env varsayılanı" yoktur: ses açıkça yazılır.
 */
export function TutorVoiceFields({ issues }: { issues: TutorIssues }) {
  const editor = useTutorsStore((s) => s.editor);
  const tts = useTutorsStore((s) => s.tts);
  const saving = useTutorsStore((s) => s.saving);
  if (!editor || !tts) return null;
  const { form } = editor;

  const providerItems = TTS_PROVIDERS.map((p) => ({
    value: p,
    label: tts.configured[p] ? PROVIDER_LABEL[p] : `${PROVIDER_LABEL[p]} · no API key`,
  }));
  const models = tts.models[form.provider];
  const catalog = tts.voices[form.provider];
  const voiceItems = (catalog ?? []).map((v) => ({ value: v.id, label: `${v.id} · ${v.hint}` }));
  if (catalog && form.voiceId && !catalog.some((v) => v.id === form.voiceId)) {
    voiceItems.unshift({ value: form.voiceId, label: `${form.voiceId} · not in catalog` });
  }
  const noProvider = !TTS_PROVIDERS.some((p) => tts.configured[p]);
  const voiceHint = noProvider
    ? "No TTS provider has an API key in .env."
    : "The tutor's own voice — changing the global TTS provider doesn't change it.";

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Voice</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Provider" htmlFor="tutor-provider">
          <Select
            value={form.provider}
            onValueChange={(v) => TutorsController.setProvider(v as TtsProvider)}
            items={providerItems}
            disabled={saving}
          >
            <SelectTrigger id="tutor-provider" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providerItems.map((p) => (
                <SelectItem key={p.value} value={p.value} disabled={!tts.configured[p.value]}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label={form.provider === "azure" || catalog ? "Voice name" : "Voice ID"}
          htmlFor="tutor-voice"
          issues={issues.voice}
          hint={voiceHint}
        >
          {catalog ? (
            <Select
              value={form.voiceId || null}
              onValueChange={(v) => TutorsController.setField({ voiceId: (v as string | null) ?? "" })}
              items={voiceItems}
              disabled={saving}
            >
              <SelectTrigger id="tutor-voice" className="w-full" aria-invalid={issues.voice ? true : undefined}>
                <SelectValue placeholder="Pick a voice" />
              </SelectTrigger>
              <SelectContent>
                {voiceItems.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="tutor-voice"
              value={form.voiceId}
              disabled={saving}
              onChange={(e) => TutorsController.setField({ voiceId: e.target.value })}
              placeholder={tts.defaultVoiceId[form.provider] ?? VOICE_PLACEHOLDER[form.provider]}
              maxLength={TUTOR_LIMITS.voiceMax}
              className="font-mono text-sm"
              spellCheck={false}
              autoComplete="off"
              aria-invalid={issues.voice ? true : undefined}
            />
          )}
        </FormField>

        {models.length > 1 && (
          <FormField label="Model" htmlFor="tutor-model" hint="Allowed models come from the server list.">
            <Select
              value={form.modelId}
              onValueChange={(v) => TutorsController.setField({ modelId: v as string })}
              items={models.map((m) => ({ value: m, label: m }))}
              disabled={saving}
            >
              <SelectTrigger id="tutor-model" className="w-full">
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
          </FormField>
        )}
      </div>
      <TutorSampleRow />
    </section>
  );
}

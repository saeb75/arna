"use client";

import type { TtsProvider } from "@glotmate/contracts";
import { ArrowLeft, CheckCircle2, KeyRound, Layers, Save, Undo2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsController } from "@/controllers/SettingsController";
import { PROVIDER_LABEL } from "@/lib/labels";
import { fadeUp } from "@/lib/motion";
import { useSettingsStore } from "@/stores/useSettingsStore";

/** Operatöre dönük tek satır özet — ürün adları çevrilmez */
const PROVIDER_DESCRIPTION: Record<TtsProvider, string> = {
  elevenlabs: "with-timestamps endpoint; ~32 languages. Character timing already in the client format; one clip per language switch.",
  inworld: "Realtime TTS-2; 200+ languages. CHARACTER timestamps converted on the server; one clip per language switch.",
  azure:
    "Multilingual neural voice; the whole turn goes out as one SSML request (<lang> per segment). Word boundaries from the Speech SDK drive lip-sync. Markup is billable.",
};

/**
 * Sağlayıcı sayfası başlığı: rozetler + aksiyonlar (Set as active · Undo · Save).
 * Taslak TÜM sağlayıcıları kapsar (tek `tts` satırı); Save hepsini yazar.
 */
export function TtsProviderHeader({ provider }: { provider: TtsProvider }) {
  const data = useSettingsStore((s) => s.data);
  const draft = useSettingsStore((s) => s.draft);
  const saving = useSettingsStore((s) => s.saving);
  if (!data || !draft) return null;

  const configured = data.configured[provider];
  const active = data.settings.provider === provider;
  const selected = draft.provider === provider;
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.settings);
  const canActivate = configured && Boolean(draft[provider].voiceId ?? data.defaultVoiceId[provider]);

  return (
    <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-3">
      <Link href="/settings/voice" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Voice
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            {PROVIDER_LABEL[provider]}
            {active && <Badge>Active</Badge>}
            {selected && !active && <Badge variant="outline">Selected · not saved</Badge>}
            {!configured && (
              <Badge variant="outline">
                <KeyRound data-icon="inline-start" />
                No API key in .env
              </Badge>
            )}
            {data.capabilities[provider].multiLanguageClip && (
              <Badge variant="secondary">
                <Layers data-icon="inline-start" />
                Single clip · mixed languages
              </Badge>
            )}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{PROVIDER_DESCRIPTION[provider]}</p>
        </div>
        <div className="flex items-center gap-2">
          {!selected && (
            <Button variant="outline" size="sm" onClick={() => SettingsController.setProvider(provider)} disabled={!canActivate}>
              <CheckCircle2 data-icon="inline-start" />
              Set as active
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => SettingsController.resetDraft()} disabled={!dirty || saving}>
            <Undo2 data-icon="inline-start" />
            Undo
          </Button>
          <Button size="sm" onClick={() => void SettingsController.save()} disabled={!dirty || saving}>
            <Save data-icon="inline-start" className={saving ? "animate-pulse" : undefined} />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {dirty && <p className="text-xs text-muted-foreground">Unsaved changes — Save writes the whole voice configuration (all providers).</p>}
    </motion.header>
  );
}

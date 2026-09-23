"use client";

import type { TtsProvider } from "@glotmate/contracts";
import { ChevronRight, KeyRound, Layers } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PROVIDER_LABEL } from "@/lib/labels";
import { useSettingsStore } from "@/stores/useSettingsStore";

/** Tek sağlayıcı satırı: ad, rozetler, ses/model özeti → detay sayfası. */
export function TtsProviderListItem({ provider }: { provider: TtsProvider }) {
  const data = useSettingsStore((s) => s.data);
  const draft = useSettingsStore((s) => s.draft);
  if (!data || !draft) return null;

  const cfg = draft[provider];
  const configured = data.configured[provider];
  const active = data.settings.provider === provider;
  const selected = draft.provider === provider;
  const edited = JSON.stringify(cfg) !== JSON.stringify(data.settings[provider]);
  const voice = cfg.voiceId ?? data.defaultVoiceId[provider];
  const showModel = data.models[provider].length > 1;

  return (
    <li>
      <Link
        href={`/settings/voice/${provider}`}
        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
      >
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {PROVIDER_LABEL[provider]}
            {active && <Badge>Active</Badge>}
            {selected && !active && <Badge variant="outline">Selected · not saved</Badge>}
            {edited && <Badge variant="outline">Unsaved edits</Badge>}
            {!configured && (
              <Badge variant="outline">
                <KeyRound data-icon="inline-start" />
                No API key
              </Badge>
            )}
            {data.capabilities[provider].multiLanguageClip && (
              <Badge variant="secondary">
                <Layers data-icon="inline-start" />
                Single clip
              </Badge>
            )}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Voice <span className="font-mono text-foreground/80">{voice ?? "—"}</span>
            {!cfg.voiceId && voice && <span> (.env default)</span>}
            {showModel && (
              <>
                {" · "}Model <span className="font-mono text-foreground/80">{cfg.modelId}</span>
              </>
            )}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}

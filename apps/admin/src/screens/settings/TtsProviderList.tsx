"use client";

import { TTS_PROVIDERS } from "@glotmate/contracts";
import { TtsProviderListItem } from "@/screens/settings/TtsProviderListItem";

/** Sağlayıcı listesi — her satır kendi detay sayfasına gider; burada form yok. */
export function TtsProviderList() {
  return (
    <section className="rounded-xl border border-border/60 bg-card shadow-xs">
      <header className="border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold">Voice providers</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Voice, model and preview live on each provider&apos;s page. Unsaved edits are kept until you save or undo.
        </p>
      </header>
      <ul className="divide-y divide-border/60">
        {TTS_PROVIDERS.map((p) => (
          <TtsProviderListItem key={p} provider={p} />
        ))}
      </ul>
    </section>
  );
}

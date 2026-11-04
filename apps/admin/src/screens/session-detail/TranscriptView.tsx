import type { AdminSessionRoleplay, AdminTranscriptTurn } from "@glotmate/contracts";
import { Fragment, useMemo } from "react";
import { PHASE_LABEL } from "@/lib/labels";
import { annotateTranscript } from "@/lib/transcript";
import { TranscriptTurnBubble } from "@/screens/session-detail/TranscriptTurnBubble";

/**
 * Sohbetin tamamı: script satırları (istemcinin logladığı deterministik metin) +
 * chat satırları (sunucu LLM yolu), id sırasıyla. Faz değişince ayırıcı.
 * İşaretler `lib/transcript.ts`'te türetilir: practice'te hedef yapı, roleplay'de
 * tiklenen iletişim hedefi (her ikisi de kendi fazının öğrenci turlarıyla, 0 tabanlı).
 */
export function TranscriptView({
  turns,
  hitTurns,
  roleplay,
}: {
  turns: AdminTranscriptTurn[];
  hitTurns: number[];
  roleplay: AdminSessionRoleplay | null;
}) {
  const items = useMemo(() => annotateTranscript(turns, hitTurns, roleplay), [turns, hitTurns, roleplay]);

  if (turns.length === 0) {
    return (
      <section className="rounded-xl border border-border/60 bg-card p-6 text-sm text-muted-foreground shadow-xs">
        No transcript turns were logged for this session.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border/60 bg-card shadow-xs">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold">Transcript</h2>
        <span className="text-xs text-muted-foreground">
          {turns.length} turns · {turns.filter((t) => t.source === "chat").length} via LLM
          {turns.some((t) => t.source === "failed") && (
            <span className="text-destructive"> · {turns.filter((t) => t.source === "failed").length} unanswered</span>
          )}
        </span>
      </header>
      <ol className="flex flex-col gap-3 p-4">
        {items.map(({ t, phaseChanged, hit }) => (
          <Fragment key={t.id}>
            {phaseChanged && t.phase && (
              <li className="my-1 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                <span className="h-px flex-1 bg-border/70" />
                {PHASE_LABEL[t.phase] ?? t.phase}
                <span className="h-px flex-1 bg-border/70" />
              </li>
            )}
            <li>
              <TranscriptTurnBubble turn={t} hit={hit} />
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  );
}

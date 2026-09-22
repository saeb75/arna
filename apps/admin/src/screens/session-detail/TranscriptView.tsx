import type { AdminTranscriptTurn } from "@glotmate/contracts";
import { Fragment } from "react";
import { PHASE_LABEL } from "@/lib/labels";
import { TranscriptTurnBubble } from "@/screens/session-detail/TranscriptTurnBubble";

/**
 * Sohbetin tamamı: script satırları (istemcinin logladığı deterministik metin) +
 * chat satırları (sunucu LLM yolu), id sırasıyla. Faz değişince ayırıcı.
 * `hitTurns` practice'te hedef yapının üretildiği öğrenci turlarını işaretler.
 */
export function TranscriptView({ turns, hitTurns }: { turns: AdminTranscriptTurn[]; hitTurns: number[] }) {
  if (turns.length === 0) {
    return (
      <section className="rounded-xl border border-border/60 bg-card p-6 text-sm text-muted-foreground shadow-xs">
        No transcript turns were logged for this session.
      </section>
    );
  }

  // Faz ayırıcıları ve hedef-isabet işaretleri render'dan ÖNCE türetilir (saf döngü):
  // render callback'i içinde dış değişken mutasyonu React kuralını bozar.
  const items = annotate(turns, hitTurns);

  return (
    <section className="rounded-xl border border-border/60 bg-card shadow-xs">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold">Transcript</h2>
        <span className="text-xs text-muted-foreground">
          {turns.length} turns · {turns.filter((t) => t.source === "chat").length} via LLM
        </span>
      </header>
      <ol className="flex flex-col gap-3 p-4">
        {items.map(({ t, phaseChanged, hit }) => {
          return (
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
          );
        })}
      </ol>
    </section>
  );
}

/** Faz değişimi + practice'te öğrenci turunun hitTurns içinde olup olmadığı */
function annotate(turns: AdminTranscriptTurn[], hitTurns: number[]) {
  const hits = new Set(hitTurns);
  let lastPhase: string | null | undefined;
  let practiceUserIndex = -1;
  return turns.map((t) => {
    const phaseChanged = t.phase !== lastPhase;
    lastPhase = t.phase;
    let hit = false;
    if (t.phase === "practice" && t.role === "user") {
      practiceUserIndex++;
      hit = hits.has(practiceUserIndex);
    }
    return { t, phaseChanged, hit };
  });
}

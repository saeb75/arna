import type { SessionPosition } from "@glotmate/contracts";
import { PHASE_LABEL } from "@/lib/labels";

/**
 * Devam imleci — "ders nerede takıldı?" sorusunun cevabı. İstemcinin
 * fire-and-forget sync'lediği anlık görüntü; açık oturumda son bilinen konum.
 */
export function SessionPositionCard({ position: p, hitTurns }: { position: SessionPosition | null; hitTurns: number[] }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">Position cursor</h2>
      {!p ? (
        <p className="mt-2 text-xs text-muted-foreground">No position synced (legacy session or never reached a beat).</p>
      ) : (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
          <dt className="text-muted-foreground">Phase</dt>
          <dd>{PHASE_LABEL[p.phase]}</dd>
          <dt className="text-muted-foreground">Awaiting</dt>
          <dd className="font-mono">{p.awaiting ?? "—"}</dd>
          <dt className="text-muted-foreground">Beat</dt>
          <dd className="font-mono">
            #{p.beatIndex}
            {p.beatId ? ` (${p.beatId})` : ""}
          </dd>
          <dt className="text-muted-foreground">Beat exchanges</dt>
          <dd className="tabular-nums">{p.beatExchanges}</dd>
          <dt className="text-muted-foreground">Attempt</dt>
          <dd className="tabular-nums">{p.attempt}</dd>
          <dt className="text-muted-foreground">Question invites</dt>
          <dd className="tabular-nums">{p.invites}</dd>
          <dt className="text-muted-foreground">Practice turn</dt>
          <dd className="tabular-nums">{p.practiceTurn}</dd>
          <dt className="text-muted-foreground">Target hits</dt>
          <dd className="tabular-nums">{hitTurns.length ? `${hitTurns.length} (turns ${hitTurns.join(", ")})` : "0"}</dd>
        </dl>
      )}
    </section>
  );
}

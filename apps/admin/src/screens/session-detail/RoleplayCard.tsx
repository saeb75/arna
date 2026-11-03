import type { AdminSessionRoleplay } from "@glotmate/contracts";
import { CircleCheck, Circle } from "lucide-react";
import Link from "next/link";
import { RatioBar } from "@/components/shared/RatioBar";

/**
 * Roleplay denemesi — senaryo (revizyona pinli), oynanan seviye, komplikasyon,
 * hedefler (tik geri alınmaz) ve isabetlerin denetim izi: öğrencinin BİREBİR sözü
 * (kanıt), roleplay fazındaki öğrenci turu (0 tabanlı) ve dedektör sürümü.
 */
export function RoleplayCard({ roleplay: rp }: { roleplay: AdminSessionRoleplay }) {
  const done = rp.objectives.filter((o) => o.done).length;
  const labels = new Map(rp.objectives.map((o) => [o.id, o.label]));
  const hits = [...rp.hits].sort((a, b) => a.turnIndex - b.turnIndex);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Role-play</h2>
        <span className="font-mono text-[10px] text-muted-foreground">policy v{rp.levelPolicyVersion}</span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Scenario</dt>
        <dd className="min-w-0">
          <Link href={`/roleplays/${rp.roleplayId}`} className="font-medium hover:underline">
            {rp.title}
          </Link>
          <span className="ml-1 font-mono text-[10px] text-muted-foreground">{rp.roleplayId}</span>
        </dd>
        <dt className="text-muted-foreground">Revision</dt>
        <dd className="font-mono" title={rp.revisionId}>
          r{rp.revision}
        </dd>
        <dt className="text-muted-foreground">Played level</dt>
        <dd className="font-mono">{rp.playedLevel}</dd>
        <dt className="text-muted-foreground">Complication</dt>
        <dd>
          {rp.complicationId ? (
            <span>
              {rp.complicationText ?? <span className="font-mono">{rp.complicationId}</span>}
            </span>
          ) : (
            <span className="text-muted-foreground">none</span>
          )}
        </dd>
      </dl>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Objectives</span>
        </div>
        <RatioBar ratio={rp.objectives.length ? done / rp.objectives.length : 0} label={`${done}/${rp.objectives.length}`} />
        <ul className="mt-1 flex flex-col gap-1 text-xs">
          {rp.objectives.map((o) => (
            <li key={o.id} className="flex items-start gap-2">
              {o.done ? (
                <CircleCheck className="mt-px size-3.5 shrink-0 text-brand" aria-label="done" />
              ) : (
                <Circle className="mt-px size-3.5 shrink-0 text-muted-foreground/60" aria-label="not done" />
              )}
              <span className={o.done ? undefined : "text-muted-foreground"}>
                {o.label} <span className="font-mono text-[10px] text-muted-foreground/80">{o.id}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
        <span className="text-xs font-medium">Hits ({hits.length})</span>
        {hits.length === 0 ? (
          <p className="text-xs text-muted-foreground">No objective was ticked in this session.</p>
        ) : (
          <ol className="flex flex-col gap-2 text-xs">
            {hits.map((h) => (
              <li key={`${h.objectiveId}-${h.turnIndex}`} className="rounded-md bg-muted/40 px-2.5 py-1.5">
                <p className="font-medium">{labels.get(h.objectiveId) ?? h.objectiveId}</p>
                <p className="mt-0.5 italic">“{h.evidence}”</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  student turn #{h.turnIndex} · detector <span className="font-mono">{h.detectorVersion}</span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

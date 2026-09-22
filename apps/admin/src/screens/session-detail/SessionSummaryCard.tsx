import type { AdminSessionDetail } from "@glotmate/contracts";
import { formatDateTime } from "@/lib/labels";

/** Oturum sonu çıkarımı (Memory v1): özet + süreklilik kancası + gözlenen hatalar. */
export function SessionSummaryCard({ summary: s }: { summary: AdminSessionDetail["summary"] }) {
  const errors = Array.isArray(s?.errorsObserved) ? (s!.errorsObserved as unknown[]) : [];
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">End-of-session summary</h2>
      {!s ? (
        <p className="mt-2 text-xs text-muted-foreground">No summary — the session is open or extraction did not run.</p>
      ) : (
        <div className="mt-2 flex flex-col gap-2 text-xs">
          <p>{s.summary}</p>
          {s.continuityHook && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Continuity hook · </span>
              {s.continuityHook}
            </p>
          )}
          {errors.length > 0 && (
            <div>
              <p className="font-medium text-destructive">Errors observed ({errors.length})</p>
              <ul className="mt-1 list-disc pl-5">
                {errors.map((e, i) => (
                  <li key={i}>{typeof e === "string" ? e : JSON.stringify(e)}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-muted-foreground">Extracted {formatDateTime(s.createdAt)}</p>
        </div>
      )}
    </section>
  );
}

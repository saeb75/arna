import type { AdminUserDetail } from "@glotmate/contracts";
import { formatDateTime } from "@/lib/labels";

/** Ünite sonu testleri — ayna, kapı değil; her deneme ayrı satır. */
export function CheckpointsCard({ checkpoints }: { checkpoints: AdminUserDetail["checkpoints"] }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">Unit tests</h2>
      {checkpoints.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No unit tests taken yet.</p>
      ) : (
        <table className="mt-3 w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="pb-1 text-left font-medium">Unit</th>
              <th className="pb-1 text-right font-medium">Score</th>
              <th className="pb-1 text-right font-medium">Taken</th>
            </tr>
          </thead>
          <tbody>
            {checkpoints.map((c, i) => (
              <tr key={i} className="border-t border-border/60">
                <td className="py-1">
                  <span className="font-mono">{c.level}</span> · Unit {c.unitIndex}
                </td>
                <td className="py-1 text-right tabular-nums">
                  <span className="font-medium">{c.score}</span>
                  <span className="text-muted-foreground"> / {c.total}</span>
                </td>
                <td className="py-1 text-right text-muted-foreground">{formatDateTime(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

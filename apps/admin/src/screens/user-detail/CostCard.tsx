import type { AdminUserDetail } from "@glotmate/contracts";
import { formatUsd } from "@/lib/labels";

/** LLM maliyeti — toplam, son 30 gün, amaç kırılımı. Renk yok; sayılar konuşur. */
export function CostCard({ cost }: { cost: AdminUserDetail["cost"] }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">LLM cost</h2>
      <div className="mt-3 flex gap-8">
        <div>
          <p className="text-xs text-muted-foreground">All time</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{formatUsd(cost.totalUsd)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{formatUsd(cost.last30dUsd)}</p>
        </div>
      </div>
      {cost.byPurpose.length > 0 && (
        <table className="mt-4 w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="pb-1 text-left font-medium">Purpose</th>
              <th className="pb-1 text-right font-medium">Calls</th>
              <th className="pb-1 text-right font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {cost.byPurpose.map((r) => (
              <tr key={r.purpose} className="border-t border-border/60">
                <td className="py-1 font-mono">{r.purpose}</td>
                <td className="py-1 text-right tabular-nums">{r.calls}</td>
                <td className="py-1 text-right tabular-nums">{formatUsd(r.usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

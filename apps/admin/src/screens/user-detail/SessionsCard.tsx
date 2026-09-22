import type { AdminUserSession } from "@glotmate/contracts";
import { SessionRow } from "@/screens/user-detail/SessionRow";

/** Son 20 oturum + özet. Transkript YOK — sunucu göndermez (gizlilik). */
export function SessionsCard({ sessions }: { sessions: AdminUserSession[] }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Recent sessions</h2>
        <span className="text-xs text-muted-foreground">last {sessions.length}</span>
      </div>
      {sessions.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No sessions yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border/60 rounded-lg border border-border/60">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </ul>
      )}
    </section>
  );
}

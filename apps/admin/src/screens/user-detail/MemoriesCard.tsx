import type { AdminUserDetail } from "@glotmate/contracts";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/labels";

/** Hafıza gerçekleri — öğrencinin kendi sözünden türer; salt okunur, düzenleme yok. */
export function MemoriesCard({ memories }: { memories: AdminUserDetail["memories"] }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">Memory</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Facts extracted from the learner&apos;s own speech (last {memories.length}). Read-only — grammar performance is never stored here.
      </p>
      {memories.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nothing extracted yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2 text-xs">
          {memories.map((m) => (
            <li key={m.id} className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0 font-mono text-[10px]">{m.kind}</Badge>
              <span className="flex-1">{m.text}</span>
              <span className="shrink-0 text-muted-foreground">{formatRelative(m.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

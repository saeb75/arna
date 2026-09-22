import { TRACKS, type SceneVariant } from "@glotmate/contracts";
import { TRACK_LABEL } from "@/lib/labels";

/** 5 track'in sahnesi — salt okunur; sahne düzenleme yok (yeniden üretim var) */
export function SceneList({ scenes }: { scenes: Record<string, SceneVariant> }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">Scenes</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Role-play setting per conversation context — the pedagogy stays the same.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {TRACKS.map((t) => {
          const s = scenes[t];
          return (
            <article key={t} className="flex flex-col gap-1.5 rounded-lg border border-border/60 p-3 text-xs">
              <header className="flex items-center justify-between">
                <span className="font-medium">{TRACK_LABEL[t] ?? t}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{t}</span>
              </header>
              {s ? (
                <>
                  <p>
                    <span className="text-muted-foreground">Persona · </span>
                    {s.persona.name}, {s.persona.role}
                    {s.persona.mood ? ` (${s.persona.mood})` : ""}
                  </p>
                  <p className="text-muted-foreground">{s.scene}</p>
                  <p>
                    <span className="text-muted-foreground">Task · </span>
                    {s.objective}
                  </p>
                  <p className="italic text-foreground/80">“{s.avatarOpening}”</p>
                </>
              ) : (
                <p className="text-destructive">No scene for this track — lint rejects this.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

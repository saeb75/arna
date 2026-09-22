import type { DraftParse } from "@/lib/coreDraft";

/** İstemci şema hataları: yol + mesaj. Sunucuya gitmeden görünür. */
export function DraftIssues({ parse }: { parse: Exclude<DraftParse, { ok: true }> }) {
  if (parse.kind === "json") {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        JSON error: {parse.message}
      </p>
    );
  }
  return (
    <ul className="max-h-48 space-y-0.5 overflow-auto rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
      {parse.issues.map((i, n) => (
        <li key={n} className="flex gap-2">
          <code className="shrink-0 font-mono text-[11px] opacity-80">{i.path}</code>
          <span>{i.message}</span>
        </li>
      ))}
    </ul>
  );
}

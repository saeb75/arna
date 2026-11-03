"use client";

import { CircleCheck, Loader2 } from "lucide-react";
import { LintReportView } from "@/components/shared/LintReportView";
import { errorLabel } from "@/lib/labels";
import type { FieldIssues } from "@/lib/roleplayDraft";
import type { EditorLint } from "@/stores/useRoleplayEditorStore";

/** Alan yolu → okunur ad ("objectives.1.label" → "Objective 2 · label") */
function fieldName(path: string): string {
  const [head, idx, leaf] = path.split(".");
  if ((head === "objectives" || head === "complications") && idx !== undefined && /^\d+$/.test(idx)) {
    return `${head === "objectives" ? "Objective" : "Complication"} ${Number(idx) + 1}${leaf ? ` · ${leaf}` : ""}`;
  }
  return path.replace(/^persona\./, "Persona · ");
}

/**
 * Editörün iki kapısı yan yana: (1) istemci — şema + yapısal kurallar, alan altında da
 * görünür; (2) sunucu kuru-koşu lint'i (`lintRoleplay`) — hatalar kaydı ENGELLER,
 * uyarılar engellemez. Sunucu mesajları olduğu gibi gösterilir.
 */
export function EditorChecks({
  issues,
  lint,
  pending,
}: {
  issues: FieldIssues;
  lint: EditorLint;
  /** İstemci kapısı geçti ama güncel spec için rapor henüz yok */
  pending: boolean;
}) {
  const entries = Object.entries(issues);
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 text-xs shadow-xs">
      <div>
        <h3 className="text-sm font-semibold">Checks</h3>
        <p className="mt-0.5 text-muted-foreground">Errors block saving; warnings do not.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-medium">Form</p>
        {entries.length === 0 ? (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <CircleCheck className="size-3.5 text-brand" />
            All fields valid.
          </p>
        ) : (
          <ul className="flex max-h-56 flex-col gap-1 overflow-auto rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
            {entries.map(([path, msgs]) => (
              <li key={path}>
                <span className="font-medium">{fieldName(path)}</span> — {msgs.join(" ")}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-medium">Server lint</p>
        {entries.length > 0 ? (
          <p className="text-muted-foreground">Runs once the form is valid.</p>
        ) : pending ? (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Checking…
          </p>
        ) : lint.report ? (
          <LintReportView report={lint.report} compact />
        ) : lint.error ? (
          <p className="text-destructive">{errorLabel(lint.error)}</p>
        ) : (
          <p className="text-muted-foreground">Not checked yet.</p>
        )}
      </div>
    </div>
  );
}

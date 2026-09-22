"use client";

import { Braces, CheckCheck, Loader2, RotateCcw, Save } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LessonDetailController } from "@/controllers/LessonDetailController";
import { formatCore, parseDraft } from "@/lib/coreDraft";
import { useLessonDetailStore } from "@/stores/useLessonDetailStore";
import { CorePreview } from "@/screens/lesson-detail/CorePreview";
import { DraftIssues } from "@/screens/lesson-detail/DraftIssues";
import { LintReportView } from "@/screens/lesson-detail/LintReportView";

/**
 * Çekirdek JSON editörü. İki kapı: istemcide şema (anında, `parseDraft`),
 * sunucuda pedagojik lint (Lint / Kaydet). `practice.mustUse` katalogdan dayatılır —
 * burada yazılan değer kayıtta üzerine yazılır, uyarı gösterilir.
 */
export function CoreEditor({ lessonId }: { lessonId: string }) {
  const { detail, draft, busy, lintReport } = useLessonDetailStore();
  const parsed = useMemo(() => parseDraft(draft), [draft]);
  const saved = detail?.core?.core ? formatCore(detail.core.core) : "";
  const dirty = draft !== saved;
  const locked = busy !== null;

  return (
    <section className="rounded-xl border border-border/60 bg-card shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Core editor</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Edit the JSON → schema checks instantly, pedagogical lint on the server. Saving marks the row <em>ready</em>; publishing is separate.
            {dirty && <span className="ml-2 font-medium text-foreground">Unsaved changes</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => LessonDetailController.formatDraft()} disabled={!parsed.ok || locked}>
            <Braces data-icon="inline-start" />
            Format
          </Button>
          <Button variant="ghost" size="sm" onClick={() => LessonDetailController.resetDraft()} disabled={!dirty || locked}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => void LessonDetailController.lintDraft(lessonId)} disabled={!parsed.ok || locked}>
            {busy === "lint" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <CheckCheck data-icon="inline-start" />}
            Lint
          </Button>
          <Button size="sm" onClick={() => void LessonDetailController.saveDraft(lessonId)} disabled={!parsed.ok || !dirty || locked}>
            {busy === "save" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            Save
          </Button>
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-border/60">
        <div className="flex flex-col gap-2 p-4">
          <Textarea
            value={draft}
            onChange={(e) => LessonDetailController.setDraft(e.target.value)}
            spellCheck={false}
            disabled={locked}
            className="min-h-[520px] resize-y font-mono text-xs leading-relaxed"
            placeholder={detail?.core ? "" : "No core for this lesson yet — paste a LessonCore JSON here or start with 'Generate'."}
          />
          <p className="text-[11px] text-muted-foreground">
            <code>practice.mustUse</code> comes from the catalog ({detail?.lesson.targetPhrases.join(", ")}); whatever you write here is overwritten on save.
          </p>
          {!parsed.ok && <DraftIssues parse={parsed} />}
          {lintReport && <LintReportView report={lintReport} />}
        </div>
        <div className="max-h-[640px] overflow-auto p-4">
          {parsed.ok ? (
            <CorePreview core={parsed.core} />
          ) : (
            <p className="text-xs text-muted-foreground">The draft must pass the schema to preview.</p>
          )}
        </div>
      </div>
    </section>
  );
}

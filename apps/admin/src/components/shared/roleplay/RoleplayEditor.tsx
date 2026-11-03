"use client";

import { Braces, Loader2, Plus, RotateCcw, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { ROLEPLAY_SLUG_RE, candidateKey, formToCandidate, parseSpecForm, specKey } from "@/lib/roleplayDraft";
import { useRoleplayEditorStore, type EditorSource } from "@/stores/useRoleplayEditorStore";
import { EditorChecks } from "@/components/shared/roleplay/EditorChecks";
import { RoleplayEditorForm } from "@/components/shared/roleplay/RoleplayEditorForm";
import { SpecJsonView } from "@/components/shared/roleplay/SpecJsonView";

function sourceText(source: EditorSource): string {
  switch (source.kind) {
    case "new":
      return "New scenario — creating saves revision 1 as a draft. Nothing is live until you publish.";
    case "draft":
      return `Editing open draft r${source.revision} — saving updates it. Students never see drafts.`;
    case "published":
      return `Editing a copy of published r${source.revision} — saving creates a new draft; r${source.revision} stays live until you publish.`;
    case "revision":
      return `No published revision — editing a copy of r${source.revision}; saving creates a new draft.`;
  }
}

/**
 * Roleplay editörü (detay "Editor" sekmesi + /roleplays/new). Yapılandırılmış form +
 * sağda iki kapının durumu. Kayıt: istemci kapısı geçmeli, güncel spec için sunucu
 * lint'i gelmiş ve HATASIZ olmalı (uyarılar engellemez). JSON görünümü salt okunur.
 * Görünüm anahtarı (form/JSON) yerel state — sunum.
 */
export function RoleplayEditor({ mode, roleplayId }: { mode: "detail" | "new"; roleplayId?: string }) {
  const { form, source, baseline, lint, saving, slug } = useRoleplayEditorStore();
  const [showJson, setShowJson] = useState(false);

  const parsed = useMemo(() => parseSpecForm(form), [form]);
  const dirty = useMemo(() => candidateKey(form) !== baseline, [form, baseline]);
  const currentKey = parsed.ok ? specKey(parsed.spec) : null;
  const lintCurrent = currentKey !== null && lint.forKey === currentKey;
  const pending = parsed.ok && (lint.checking || !lintCurrent);
  const serverErrors = lintCurrent ? (lint.report?.errors.length ?? 0) : 0;
  const blocked = !parsed.ok || pending || serverErrors > 0;
  const canSubmit = mode === "new" ? !blocked && ROLEPLAY_SLUG_RE.test(slug) && !saving : !blocked && dirty && !saving && !!roleplayId;

  const reason = !parsed.ok
    ? "Fix the highlighted fields first"
    : pending
      ? "Waiting for the server lint"
      : serverErrors > 0
        ? "Server lint has errors"
        : mode === "detail" && !dirty
          ? "No changes to save"
          : undefined;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0 rounded-xl border border-border/60 bg-card shadow-xs">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Scenario spec</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {sourceText(source)}
              {dirty && mode === "detail" && <span className="ml-2 font-medium text-foreground">Unsaved changes</span>}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Toggle size="sm" variant="outline" pressed={showJson} onPressedChange={setShowJson} aria-label="Show JSON">
              <Braces />
              JSON
            </Toggle>
            <Button variant="ghost" size="sm" onClick={() => RoleplayEditorController.discardLocal()} disabled={!dirty || saving}>
              <RotateCcw data-icon="inline-start" />
              Reset
            </Button>
            {mode === "detail" ? (
              <Button
                size="sm"
                onClick={() => roleplayId && void RoleplayEditorController.saveDraft(roleplayId)}
                disabled={!canSubmit}
                title={canSubmit ? "Save as the open draft" : reason}
              >
                {saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
                Save draft
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => void RoleplayEditorController.create()}
                disabled={!canSubmit}
                title={canSubmit ? "Create the scenario with revision 1 as a draft" : (reason ?? "Enter a valid id")}
              >
                {saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
                Create role-play
              </Button>
            )}
          </div>
        </header>

        {showJson ? (
          <div className="flex flex-col gap-2 p-4">
            {!parsed.ok && <p className="text-xs text-muted-foreground">Not valid yet — showing the form as it would be sent.</p>}
            <SpecJsonView value={parsed.ok ? parsed.spec : formToCandidate(form)} />
          </div>
        ) : (
          <RoleplayEditorForm form={form} issues={parsed.issues} locked={saving} />
        )}
      </section>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
        <EditorChecks issues={parsed.issues} lint={lint} pending={pending} />
      </aside>
    </div>
  );
}

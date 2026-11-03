"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { LIMITS, type ComplicationForm, type FieldIssues } from "@/lib/roleplayDraft";
import { FormField } from "@/components/shared/roleplay/FormField";
import { LevelSelect } from "@/components/shared/roleplay/LevelSelect";

/** Tek komplikasyon — persona'nın çıkaracağı zorluk; oturumda oynanan seviyede İLK aktif olan kullanılır */
export function ComplicationEditor({
  index,
  complication: c,
  issues,
  locked,
}: {
  index: number;
  complication: ComplicationForm;
  issues: FieldIssues;
  locked: boolean;
}) {
  const at = (field: string) => issues[`complications.${index}.${field}`];
  const idFor = (field: string) => `rp-complication-${c.key}-${field}`;
  return (
    <li className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">Complication {index + 1}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Remove complication"
          disabled={locked}
          onClick={() => RoleplayEditorController.removeComplication(index)}
        >
          <Trash2 />
        </Button>
      </div>
      <FormField
        label="Text"
        htmlFor={idFor("text")}
        issues={at("text")}
        count={{ value: c.text.trim().length, max: LIMITS.complicationText }}
        hint="What the persona throws in, in English — e.g. “The table they want is reserved.”"
      >
        <Textarea
          id={idFor("text")}
          value={c.text}
          disabled={locked}
          onChange={(e) => RoleplayEditorController.updateComplication(index, { text: e.target.value })}
          className="min-h-14"
          aria-invalid={!!at("text") || undefined}
        />
      </FormField>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,14rem)_auto]">
        <FormField
          label="Id"
          htmlFor={idFor("id")}
          issues={at("id")}
          hint={c.idAuto ? "Derived from the text until you edit it." : "Permanent — attempts refer to it."}
        >
          <Input
            id={idFor("id")}
            value={c.id}
            disabled={locked}
            onChange={(e) => RoleplayEditorController.updateComplication(index, { id: e.target.value })}
            className="font-mono text-xs"
            placeholder="table-reserved"
            aria-invalid={!!at("id") || undefined}
          />
        </FormField>
        <FormField label="Active from" htmlFor={idFor("level")} issues={at("activeFrom")}>
          <LevelSelect
            id={idFor("level")}
            value={c.activeFrom}
            disabled={locked}
            onChange={(activeFrom) => RoleplayEditorController.updateComplication(index, { activeFrom })}
          />
        </FormField>
      </div>
    </li>
  );
}

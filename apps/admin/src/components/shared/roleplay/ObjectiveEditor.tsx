"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { LIMITS, type FieldIssues, type ObjectiveForm } from "@/lib/roleplayDraft";
import { FormField } from "@/components/shared/roleplay/FormField";
import { LevelSelect } from "@/components/shared/roleplay/LevelSelect";

/**
 * Tek hedef. Hedef = ÖĞRENCİNİN iletişim adımı ("Ask for a table", "Get a table" değil).
 * Kimlik kalıcıdır: kayıtlı hedefte etiket değişse de türetilmez (denemeler kimliğe bağlı).
 */
export function ObjectiveEditor({
  index,
  count,
  objective: o,
  issues,
  locked,
}: {
  index: number;
  count: number;
  objective: ObjectiveForm;
  issues: FieldIssues;
  locked: boolean;
}) {
  const at = (field: string) => issues[`objectives.${index}.${field}`];
  const idFor = (field: string) => `rp-objective-${o.key}-${field}`;
  return (
    <li className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">Objective {index + 1}</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Move up"
            disabled={locked || index === 0}
            onClick={() => RoleplayEditorController.moveObjective(index, -1)}
          >
            <ArrowUp />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Move down"
            disabled={locked || index === count - 1}
            onClick={() => RoleplayEditorController.moveObjective(index, 1)}
          >
            <ArrowDown />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Remove objective"
            title={count <= LIMITS.minObjectives ? `At least ${LIMITS.minObjectives} objectives are required` : "Remove"}
            disabled={locked || count <= LIMITS.minObjectives}
            onClick={() => RoleplayEditorController.removeObjective(index)}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <FormField
          label="Label"
          htmlFor={idFor("label")}
          issues={at("label")}
          count={{ value: o.label.trim().length, max: LIMITS.objectiveLabel }}
          hint="Imperative, a step the student says — “Ask for a table”, not “Get a table”."
        >
          <Input
            id={idFor("label")}
            value={o.label}
            disabled={locked}
            onChange={(e) => RoleplayEditorController.updateObjective(index, { label: e.target.value })}
            placeholder="Ask for a table"
            aria-invalid={!!at("label") || undefined}
          />
        </FormField>
        <FormField label="Active from" htmlFor={idFor("level")} issues={at("activeFrom")}>
          <LevelSelect
            id={idFor("level")}
            value={o.activeFrom}
            disabled={locked}
            onChange={(activeFrom) => RoleplayEditorController.updateObjective(index, { activeFrom })}
          />
        </FormField>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <FormField
          label="Id"
          htmlFor={idFor("id")}
          issues={at("id")}
          hint={o.idAuto ? "Derived from the label until you edit it." : "Permanent — attempts refer to it."}
        >
          <Input
            id={idFor("id")}
            value={o.id}
            disabled={locked}
            onChange={(e) => RoleplayEditorController.updateObjective(index, { id: e.target.value })}
            className="font-mono text-xs"
            placeholder="ask-table"
            aria-invalid={!!at("id") || undefined}
          />
        </FormField>
        <FormField
          label="Opening hint"
          optional
          htmlFor={idFor("hint")}
          issues={at("openingHint")}
          count={{ value: o.openingHint.trim().length, max: LIMITS.openingHint }}
          hint="Tells the persona how to open the door to this step. Not shown to students."
        >
          <Input
            id={idFor("hint")}
            value={o.openingHint}
            disabled={locked}
            onChange={(e) => RoleplayEditorController.updateObjective(index, { openingHint: e.target.value })}
            placeholder="Mention that the window tables are free"
            aria-invalid={!!at("openingHint") || undefined}
          />
        </FormField>
      </div>
    </li>
  );
}

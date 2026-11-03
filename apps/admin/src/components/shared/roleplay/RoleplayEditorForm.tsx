"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { LIMITS, type FieldIssues, type SpecForm } from "@/lib/roleplayDraft";
import { CategoryField } from "@/components/shared/roleplay/CategoryField";
import { ComplicationEditor } from "@/components/shared/roleplay/ComplicationEditor";
import { EditorSection } from "@/components/shared/roleplay/EditorSection";
import { FormField } from "@/components/shared/roleplay/FormField";
import { LevelSelect } from "@/components/shared/roleplay/LevelSelect";
import { ObjectiveEditor } from "@/components/shared/roleplay/ObjectiveEditor";

const len = (s: string) => s.trim().length;

/**
 * Yapılandırılmış spec formu — her alan store'daki taslağa yazar (controller), her
 * değişiklik debounce'lu sunucu lint'ini tetikler. Tüm metin İngilizce içerik
 * (rol yapma HER ZAMAN İngilizce); sınırlar şemadan (`LIMITS`).
 */
export function RoleplayEditorForm({ form, issues, locked }: { form: SpecForm; issues: FieldIssues; locked: boolean }) {
  const set = RoleplayEditorController.setField.bind(RoleplayEditorController);
  const invalid = (path: string) => !!issues[path] || undefined;

  return (
    <div>
      <EditorSection title="Basics" description="Canonical English title and the discovery shelf.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="rp-title" issues={issues["title"]} count={{ value: len(form.title), max: LIMITS.title }}>
            <Input
              id="rp-title"
              value={form.title}
              disabled={locked}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ordering at a busy cafe"
              aria-invalid={invalid("title")}
            />
          </FormField>
          <CategoryField value={form.category} issues={issues["category"]} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Supported from"
            htmlFor="rp-supported"
            issues={issues["supportedFrom"]}
            hint="Technical floor. Learners below it are not locked out — the scenario is played at this level."
          >
            <LevelSelect
              id="rp-supported"
              value={form.supportedFrom}
              disabled={locked}
              invalid={!!issues["supportedFrom"]}
              onChange={(v) => set("supportedFrom", v)}
            />
          </FormField>
          <FormField
            label="Recommended from"
            htmlFor="rp-recommended"
            issues={issues["recommendedFrom"]}
            hint="Soft: ordering and a “this may stretch you” note in discovery. Never locks."
          >
            <LevelSelect
              id="rp-recommended"
              value={form.recommendedFrom}
              disabled={locked}
              invalid={!!issues["recommendedFrom"]}
              onChange={(v) => set("recommendedFrom", v)}
            />
          </FormField>
        </div>
      </EditorSection>

      <EditorSection title="Persona" description="Who the student talks to. The goal and mood steer the persona prompt.">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,10rem)]">
          <FormField label="Name" htmlFor="rp-persona-name" issues={issues["persona.name"]} count={{ value: len(form.persona.name), max: LIMITS.personaName }}>
            <Input
              id="rp-persona-name"
              value={form.persona.name}
              disabled={locked}
              onChange={(e) => RoleplayEditorController.setPersona({ name: e.target.value })}
              placeholder="Sam"
              aria-invalid={invalid("persona.name")}
            />
          </FormField>
          <FormField label="Role" htmlFor="rp-persona-role" issues={issues["persona.role"]} count={{ value: len(form.persona.role), max: LIMITS.personaRole }}>
            <Input
              id="rp-persona-role"
              value={form.persona.role}
              disabled={locked}
              onChange={(e) => RoleplayEditorController.setPersona({ role: e.target.value })}
              placeholder="Barista"
              aria-invalid={invalid("persona.role")}
            />
          </FormField>
          <FormField
            label="Mood"
            optional
            htmlFor="rp-persona-mood"
            issues={issues["persona.mood"]}
            count={{ value: len(form.persona.mood), max: LIMITS.personaMood }}
          >
            <Input
              id="rp-persona-mood"
              value={form.persona.mood}
              disabled={locked}
              onChange={(e) => RoleplayEditorController.setPersona({ mood: e.target.value })}
              placeholder="rushed"
              aria-invalid={invalid("persona.mood")}
            />
          </FormField>
        </div>
        <FormField label="Goal" htmlFor="rp-persona-goal" issues={issues["persona.goal"]} count={{ value: len(form.persona.goal), max: LIMITS.personaGoal }}>
          <Textarea
            id="rp-persona-goal"
            value={form.persona.goal}
            disabled={locked}
            onChange={(e) => RoleplayEditorController.setPersona({ goal: e.target.value })}
            className="min-h-14"
            placeholder="Take the order quickly and upsell a pastry"
            aria-invalid={invalid("persona.goal")}
          />
        </FormField>
      </EditorSection>

      <EditorSection title="Scene and opening" description="The scene is shown in the brief; the opening is the persona's first line.">
        <FormField label="Scene" htmlFor="rp-scene" issues={issues["scene"]} count={{ value: len(form.scene), max: LIMITS.scene }}>
          <Textarea
            id="rp-scene"
            value={form.scene}
            disabled={locked}
            onChange={(e) => set("scene", e.target.value)}
            className="min-h-20"
            placeholder="A busy cafe at 8 am. There is a short queue behind you."
            aria-invalid={invalid("scene")}
          />
        </FormField>
        <FormField
          label="Opening"
          htmlFor="rp-opening"
          issues={issues["opening"]}
          count={{ value: len(form.opening), max: LIMITS.opening }}
          hint="Must end with “?” — the opening hands the turn to the student, otherwise the session locks."
        >
          <Textarea
            id="rp-opening"
            value={form.opening}
            disabled={locked}
            onChange={(e) => set("opening", e.target.value)}
            className="min-h-14"
            placeholder="Morning! What can I get you?"
            aria-invalid={invalid("opening")}
          />
        </FormField>
      </EditorSection>

      <EditorSection
        title={`Objectives (${form.objectives.length}/${LIMITS.maxObjectives})`}
        description={`Communicative steps the student performs. At least ${LIMITS.minObjectives} must be active at “supported from”. Order is the order shown to students.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={locked || form.objectives.length >= LIMITS.maxObjectives}
            onClick={() => RoleplayEditorController.addObjective()}
          >
            <Plus data-icon="inline-start" />
            Add objective
          </Button>
        }
      >
        {issues["objectives"] && <p className="text-[11px] text-destructive">{issues["objectives"].join(" ")}</p>}
        <ol className="flex flex-col gap-3">
          {form.objectives.map((o, i) => (
            <ObjectiveEditor key={o.key} index={i} count={form.objectives.length} objective={o} issues={issues} locked={locked} />
          ))}
        </ol>
      </EditorSection>

      <EditorSection
        title={`Complications (${form.complications.length}/${LIMITS.maxComplications})`}
        description="Optional twists for higher levels. A session uses the first complication active at its played level."
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={locked || form.complications.length >= LIMITS.maxComplications}
            onClick={() => RoleplayEditorController.addComplication()}
          >
            <Plus data-icon="inline-start" />
            Add complication
          </Button>
        }
      >
        {issues["complications"] && <p className="text-[11px] text-destructive">{issues["complications"].join(" ")}</p>}
        {form.complications.length === 0 ? (
          <p className="text-xs text-muted-foreground">No complications — upper levels may feel flat (the server lint warns about this).</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {form.complications.map((c, i) => (
              <ComplicationEditor key={c.key} index={i} complication={c} issues={issues} locked={locked} />
            ))}
          </ol>
        )}
      </EditorSection>
    </div>
  );
}

"use client";

import { TUTOR_STATUSES, type TutorStatus } from "@glotmate/contracts";
import { FormField } from "@/components/shared/roleplay/FormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { TutorsController } from "@/controllers/TutorsController";
import { TUTOR_STATUS_LABEL } from "@/lib/labels";
import { effectiveDefault, type TutorIssues } from "@/lib/tutorDraft";
import { useTutorsStore } from "@/stores/useTutorsStore";

const STATUS_ITEMS = TUTOR_STATUSES.map((s) => ({ value: s, label: TUTOR_STATUS_LABEL[s] }));

/**
 * Görünürlük: durum, sıra, varsayılan bayrağı. Sunucu kuralları burada önden görünür:
 * ilk öğretmen kendiliğinden varsayılandır; varsayılanın bayrağı doğrudan kaldırılamaz
 * (başka birini varsayılan yapmak onu taşır); varsayılan gizlenemez.
 */
export function TutorVisibilityFields({ issues }: { issues: TutorIssues }) {
  const editor = useTutorsStore((s) => s.editor);
  const tutors = useTutorsStore((s) => s.data?.tutors ?? []);
  const saving = useTutorsStore((s) => s.saving);
  if (!editor) return null;
  const { form, mode, originalId } = editor;

  const original = originalId ? tutors.find((t) => t.id === originalId) : undefined;
  const current = tutors.find((t) => t.isDefault);
  const firstTutor = mode === "create" && tutors.length === 0;
  const lockedDefault = firstTutor || Boolean(original?.isDefault);
  const isDefault = effectiveDefault(form, { mode, tutors });
  const defaultHint = firstTutor
    ? "The first tutor always becomes the default."
    : original?.isDefault
      ? "This is the default tutor. To remove the flag, make another tutor the default."
      : `New users, and users whose tutor is hidden, get the default tutor.${current ? ` Turning this on moves the flag from ${current.name}.` : ""}`;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Visibility</h3>
      <div className="grid gap-4 md:grid-cols-[1fr_8rem]">
        <FormField
          label="Status"
          htmlFor="tutor-status"
          issues={issues.status}
          hint="Hidden tutors aren't offered; users who picked one get the default tutor until it's active again."
        >
          <Select
            value={form.status}
            onValueChange={(v) => TutorsController.setField({ status: v as TutorStatus })}
            items={STATUS_ITEMS}
            disabled={saving}
          >
            <SelectTrigger id="tutor-status" className="w-full" aria-invalid={issues.status ? true : undefined}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ITEMS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Sort order" htmlFor="tutor-sort" issues={issues.sortOrder} hint="Lower comes first.">
          <Input
            id="tutor-sort"
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            step={1}
            value={form.sortOrder}
            disabled={saving}
            onChange={(e) => TutorsController.setField({ sortOrder: e.target.value })}
            className="tabular-nums"
            aria-invalid={issues.sortOrder ? true : undefined}
          />
        </FormField>

        <FormField label="Default tutor" htmlFor="tutor-default" issues={issues.isDefault} hint={defaultHint} className="md:col-span-2">
          <Toggle
            id="tutor-default"
            variant="outline"
            className="w-fit"
            pressed={isDefault}
            disabled={saving || lockedDefault}
            onPressedChange={(v) => TutorsController.setField({ isDefault: v })}
          >
            {isDefault ? "Default" : "Not default"}
          </Toggle>
        </FormField>
      </div>
    </section>
  );
}

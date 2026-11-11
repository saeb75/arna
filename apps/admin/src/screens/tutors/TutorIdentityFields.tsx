"use client";

import { AVATAR_LABELS, TUTOR_GENDERS, type AvatarId, type TutorGender } from "@glotmate/contracts";
import { FormField } from "@/components/shared/roleplay/FormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TutorsController } from "@/controllers/TutorsController";
import { TUTOR_GENDER_LABEL } from "@/lib/labels";
import { TUTOR_LIMITS, type TutorIssues } from "@/lib/tutorDraft";
import { useTutorsStore } from "@/stores/useTutorsStore";

const GENDER_ITEMS = TUTOR_GENDERS.map((g) => ({ value: g, label: TUTOR_GENDER_LABEL[g] }));

/**
 * Kimlik (yalnız oluştururken — kalıcı), ad, 2.5D rig ve dilbilgisel cinsiyet.
 * Rig listesi koddaki kayıttan gelir; kayıtlı öğretmenin rig'i artık bağlanamıyorsa
 * listede ayrıca gösterilir ki operatör neyin değiştiğini görsün.
 */
export function TutorIdentityFields({ issues }: { issues: TutorIssues }) {
  const editor = useTutorsStore((s) => s.editor);
  const avatars = useTutorsStore((s) => s.data?.avatars ?? []);
  const saving = useTutorsStore((s) => s.saving);
  if (!editor) return null;
  const { form, mode } = editor;

  const avatarItems = avatars.map((a) => ({ value: a.id as string, label: a.label }));
  if (form.avatarId && !avatars.some((a) => a.id === form.avatarId)) {
    avatarItems.push({ value: form.avatarId, label: `${AVATAR_LABELS[form.avatarId]} · not bindable` });
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Identity</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Name"
          htmlFor="tutor-name"
          issues={issues.name}
          count={{ value: form.name.trim().length, max: TUTOR_LIMITS.nameMax }}
          hint="An English first name. Used in lesson prompts and the role-play intro (“Hi! I'm Lena”), read by English TTS."
        >
          <Input
            id="tutor-name"
            value={form.name}
            disabled={saving}
            onChange={(e) => TutorsController.setName(e.target.value)}
            placeholder="Lena"
            autoComplete="off"
            aria-invalid={issues.name ? true : undefined}
          />
        </FormField>

        {mode === "create" && (
          <FormField
            label="Id (slug)"
            htmlFor="tutor-id"
            issues={issues.id}
            hint={`Permanent — users' tutor choice points to it, so it can't be changed after creation.${form.idAuto ? " Derived from the name until you edit it." : ""}`}
          >
            <Input
              id="tutor-id"
              value={form.id}
              disabled={saving}
              onChange={(e) => TutorsController.setId(e.target.value)}
              placeholder="lena"
              className="font-mono text-sm"
              maxLength={TUTOR_LIMITS.idMax}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={issues.id ? true : undefined}
            />
          </FormField>
        )}

        <FormField
          label="Avatar rig"
          htmlFor="tutor-avatar"
          issues={issues.avatarId}
          hint="2.5D rigs that ship in the app. A new face needs a code release; a new tutor doesn't."
        >
          <Select
            value={form.avatarId || null}
            onValueChange={(v) => TutorsController.setField({ avatarId: v as AvatarId })}
            items={avatarItems}
            disabled={saving}
          >
            <SelectTrigger id="tutor-avatar" className="w-full" aria-invalid={issues.avatarId ? true : undefined}>
              <SelectValue placeholder="Pick a rig" />
            </SelectTrigger>
            <SelectContent>
              {avatarItems.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Gender"
          htmlFor="tutor-gender"
          issues={issues.gender}
          hint="Grammatical gender in native-language explanations (e.g. Spanish “estoy cansada”). Not shown to users."
        >
          <Select
            value={form.gender}
            onValueChange={(v) => TutorsController.setField({ gender: v as TutorGender })}
            items={GENDER_ITEMS}
            disabled={saving}
          >
            <SelectTrigger id="tutor-gender" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDER_ITEMS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </section>
  );
}

"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TutorsController } from "@/controllers/TutorsController";
import { formKey, validateTutorForm, visibleIssues } from "@/lib/tutorDraft";
import { useTutorsStore } from "@/stores/useTutorsStore";
import { TutorIdentityFields } from "@/screens/tutors/TutorIdentityFields";
import { TutorVisibilityFields } from "@/screens/tutors/TutorVisibilityFields";
import { TutorVoiceFields } from "@/screens/tutors/TutorVoiceFields";

/**
 * Oluştur/düzenle diyaloğu. Form store'da (`editor`); doğrulama her çizimde saf
 * `validateTutorForm` ile — kaydet de aynı fonksiyondan geçer, ekran ile kayıt ayrışmaz.
 * Dışarı tıklama kapatmaz (yazılan kaybolmasın); Esc / Cancel / X kapatır.
 */
export function TutorEditorDialog() {
  const editor = useTutorsStore((s) => s.editor);
  const open = useTutorsStore((s) => s.editorOpen);
  const data = useTutorsStore((s) => s.data);
  const tts = useTutorsStore((s) => s.tts);
  const saving = useTutorsStore((s) => s.saving);
  if (!editor || !data || !tts) return null;

  const { issues } = validateTutorForm(editor.form, {
    mode: editor.mode,
    tts,
    tutors: data.tutors,
    avatarIds: data.avatars.map((a) => a.id),
    originalId: editor.originalId,
  });
  const shown = visibleIssues(editor.form, editor.baseline, issues, editor.attempted);
  const dirty = editor.mode === "create" || formKey(editor.form) !== editor.baseline;
  const original = editor.originalId ? data.tutors.find((t) => t.id === editor.originalId) : undefined;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && TutorsController.close()} disablePointerDismissal>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editor.mode === "create" ? "New tutor" : `Edit ${original?.name ?? editor.form.name}`}</DialogTitle>
          <DialogDescription>
            {editor.mode === "create" ? (
              "Users pick a tutor during onboarding and in settings. A tutor is a name, a 2.5D avatar rig and its own voice."
            ) : (
              <>
                <span className="font-mono">{editor.originalId}</span>
                {original
                  ? ` · picked by ${original.userCount} user${original.userCount === 1 ? "" : "s"}.`
                  : ""}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <TutorIdentityFields issues={shown} />
        <Separator />
        <TutorVoiceFields issues={shown} />
        <Separator />
        <TutorVisibilityFields issues={shown} />

        <DialogFooter className="items-center">
          {editor.mode === "edit" && dirty && <span className="mr-auto text-xs text-muted-foreground">Unsaved changes</span>}
          <Button variant="outline" onClick={() => TutorsController.close()} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void TutorsController.save()} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            {editor.mode === "create" ? "Create tutor" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

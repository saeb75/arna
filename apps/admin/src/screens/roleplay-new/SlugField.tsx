"use client";

import { Wand2 } from "lucide-react";
import { FormField } from "@/components/shared/roleplay/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { ROLEPLAY_SLUG_RE } from "@/lib/roleplayDraft";
import { useRoleplayEditorStore } from "@/stores/useRoleplayEditorStore";

/**
 * Kalıcı kimlik (slug) — sonradan DEĞİŞMEZ; oturumlar ve istatistikler ona bağlı.
 * Operatör dokunana kadar başlıktan türer; "From title" türetmeye geri döner.
 */
export function SlugField() {
  const slug = useRoleplayEditorStore((s) => s.slug);
  const touched = useRoleplayEditorStore((s) => s.slugTouched);
  const saving = useRoleplayEditorStore((s) => s.saving);
  const valid = ROLEPLAY_SLUG_RE.test(slug);
  const showError = !valid && slug !== "rp-";

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <FormField
        label="Id (slug)"
        htmlFor="rp-slug"
        issues={showError ? ["Start with “rp-”, followed by 2–61 lowercase letters, digits or hyphens (the first one a letter or digit)."] : undefined}
        hint={
          touched
            ? "Permanent — it cannot be changed after creation."
            : "Derived from the title until you edit it. Permanent — it cannot be changed after creation."
        }
      >
        <div className="flex max-w-xl gap-2">
          <Input
            id="rp-slug"
            value={slug}
            disabled={saving}
            onChange={(e) => RoleplayEditorController.setSlug(e.target.value)}
            className="font-mono text-sm"
            placeholder="rp-ordering-at-a-cafe"
            aria-invalid={showError || undefined}
            spellCheck={false}
          />
          {touched && (
            <Button variant="outline" size="sm" className="h-8" disabled={saving} onClick={() => RoleplayEditorController.deriveSlugFromTitle()}>
              <Wand2 data-icon="inline-start" />
              From title
            </Button>
          )}
        </div>
      </FormField>
    </section>
  );
}

"use client";

import type { AdminRoleplayDetail } from "@glotmate/contracts";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { RoleplayPreview } from "@/components/shared/roleplay/RoleplayPreview";
import { candidateKey, parseSpecForm } from "@/lib/roleplayDraft";
import { useRoleplayEditorStore } from "@/stores/useRoleplayEditorStore";

/**
 * Önizleme kaynağı: editördeki taslak geçerliyse O (kaydedilmemiş değişiklik dahil),
 * değilse son kayıtlı hâl (taslak > yayın > en yeni revizyon) — not ile söylenir.
 */
export function PreviewTab({ detail }: { detail: AdminRoleplayDetail }) {
  const form = useRoleplayEditorStore((s) => s.form);
  const baseline = useRoleplayEditorStore((s) => s.baseline);
  const parsed = useMemo(() => parseSpecForm(form), [form]);
  const dirty = candidateKey(form) !== baseline;
  const saved = detail.draft ?? detail.revisions.find((r) => r.status === "published") ?? detail.revisions[0] ?? null;

  if (parsed.ok) {
    return (
      <RoleplayPreview
        key={detail.roleplay.id}
        spec={parsed.spec}
        note={dirty ? "Previewing unsaved editor changes." : saved ? `Previewing r${saved.revision} (${saved.status}).` : undefined}
      />
    );
  }
  if (saved) {
    return (
      <RoleplayPreview
        key={detail.roleplay.id}
        spec={saved.spec}
        note={`The editor has errors — previewing the last saved r${saved.revision} (${saved.status}).`}
      />
    );
  }
  return <EmptyState title="Nothing to preview" hint="Fill in the editor to see what a student would get." />;
}

"use client";

import type { AdminRoleplayDetail } from "@glotmate/contracts";
import { Archive, ArchiveRestore, ArrowLeft, Loader2, Rocket, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { RoleplayStatusPill } from "@/components/shared/RoleplayStatusPill";
import { StatusPill } from "@/components/shared/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleplayDetailController } from "@/controllers/RoleplayDetailController";
import { formatDateTime, formatRelative } from "@/lib/labels";
import { fadeUp } from "@/lib/motion";
import type { RoleplayBusy } from "@/stores/useRoleplayDetailStore";

/**
 * Başlık + yaşam döngüsü aksiyonları. Yayın kapısı: açık taslak var, taslağın sunucu
 * lint'i hatasız ve editörde kaydedilmemiş değişiklik YOK (yayınlanan, kayıtlı taslaktır).
 * Her aksiyon onaylıdır; sonuç bildirimi controller'da.
 */
export function RoleplayDetailHeader({
  detail,
  busy,
  editorDirty,
}: {
  detail: AdminRoleplayDetail;
  busy: RoleplayBusy | null;
  editorDirty: boolean;
}) {
  const { roleplay: rp, draft, draftLint } = detail;
  const id = rp.id;
  const lintErrors = draftLint?.errors.length ?? 0;
  const lintWarnings = draftLint?.warnings.length ?? 0;
  const canPublish = !!draft && lintErrors === 0 && !editorDirty && busy === null;
  const publishReason = !draft
    ? "No open draft — edit and save one first"
    : lintErrors > 0
      ? "The draft has lint errors"
      : editorDirty
        ? "Save or reset the editor changes first"
        : `Publish draft r${draft.revision}`;
  const spin = (b: RoleplayBusy) => busy === b && <Loader2 className="animate-spin" data-icon="inline-start" />;

  return (
    <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
      <Link href="/roleplays" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Roleplays
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RoleplayStatusPill row={rp} />
            <Badge variant="outline" className="font-normal">{rp.category}</Badge>
            {rp.publishedRevision !== null && <Badge variant="outline" className="font-mono">live r{rp.publishedRevision}</Badge>}
            {draft && (
              <StatusPill tone="neutral" dashed>
                Draft r{draft.revision} open
              </StatusPill>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{rp.title}</h1>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">{id}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Supported from <span className="font-mono text-foreground">{rp.supportedFrom}</span> · recommended from{" "}
            <span className="font-mono text-foreground">{rp.recommendedFrom}</span> · {rp.objectiveCount} objectives ·{" "}
            <span title={formatDateTime(rp.updatedAt)}>updated {formatRelative(rp.updatedAt)}</span>
          </p>
          {draft && (
            <p className="mt-1 text-xs">
              {lintErrors > 0 ? (
                <span className="text-destructive">
                  Draft lint: {lintErrors} error{lintErrors === 1 ? "" : "s"} — fix in the editor before publishing.
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Draft passes lint{lintWarnings ? ` (${lintWarnings} warning${lintWarnings === 1 ? "" : "s"})` : ""}.
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {rp.status === "active" ? (
            <ConfirmAction
              trigger={
                <Button variant="outline" size="sm" disabled={busy !== null}>
                  {spin("status") || <Archive data-icon="inline-start" />}
                  Retire
                </Button>
              }
              title={`Retire “${rp.title}”?`}
              description="It disappears from the app's discovery shelves. Revisions, attempts and stats are kept, and you can restore it at any time."
              confirmLabel="Retire"
              destructive
              onConfirm={() => void RoleplayDetailController.setStatus(id, "retired")}
            />
          ) : (
            <ConfirmAction
              trigger={
                <Button variant="outline" size="sm" disabled={busy !== null}>
                  {spin("status") || <ArchiveRestore data-icon="inline-start" />}
                  Restore
                </Button>
              }
              title={`Restore “${rp.title}”?`}
              description={
                rp.publishedRevision !== null
                  ? `It returns to discovery with the published revision r${rp.publishedRevision}.`
                  : "It becomes active again, but students only see it once a revision is published."
              }
              confirmLabel="Restore"
              onConfirm={() => void RoleplayDetailController.setStatus(id, "active")}
            />
          )}

          <ConfirmAction
            trigger={
              <Button variant="outline" size="sm" disabled={!draft || busy !== null}>
                {spin("discard") || <Trash2 data-icon="inline-start" />}
                Discard draft
              </Button>
            }
            title={draft ? `Discard draft r${draft.revision}?` : "Discard draft?"}
            description="The draft revision is deleted. It was never served to students. Unsaved editor changes are dropped too; the editor falls back to the published revision."
            confirmLabel="Discard draft"
            destructive
            onConfirm={() => void RoleplayDetailController.discard(id)}
          />

          <ConfirmAction
            trigger={
              <Button size="sm" disabled={!canPublish} title={publishReason}>
                {spin("publish") || <Rocket data-icon="inline-start" />}
                Publish draft
              </Button>
            }
            title={draft ? `Publish draft r${draft.revision}?` : "Publish draft?"}
            description={
              rp.publishedRevision !== null
                ? `New sessions will use r${draft?.revision}. The current revision r${rp.publishedRevision} is retired — it stays readable, and past sessions remain pinned to it.`
                : `r${draft?.revision} becomes the first live revision${rp.status === "retired" ? " (the role-play is retired — restore it to show it in discovery)" : ""}.`
            }
            confirmLabel="Publish"
            onConfirm={() => void RoleplayDetailController.publish(id)}
          />
        </div>
      </div>
    </motion.header>
  );
}

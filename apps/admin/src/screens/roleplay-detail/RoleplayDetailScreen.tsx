"use client";

import { useEffect, useMemo } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { RoleplayEditor } from "@/components/shared/roleplay/RoleplayEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleplayDetailController } from "@/controllers/RoleplayDetailController";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { candidateKey } from "@/lib/roleplayDraft";
import { useRoleplayDetailStore, type RoleplayTab } from "@/stores/useRoleplayDetailStore";
import { useRoleplayEditorStore } from "@/stores/useRoleplayEditorStore";
import { AttemptsTab } from "@/screens/roleplay-detail/AttemptsTab";
import { ObjectiveStatsTab } from "@/screens/roleplay-detail/ObjectiveStatsTab";
import { PreviewTab } from "@/screens/roleplay-detail/PreviewTab";
import { RevisionsTab } from "@/screens/roleplay-detail/RevisionsTab";
import { RoleplayDetailHeader } from "@/screens/roleplay-detail/RoleplayDetailHeader";
import { RoleplayDetailSkeleton } from "@/screens/roleplay-detail/RoleplayDetailSkeleton";

/**
 * Senaryo detayı: başlık aksiyonları (yayınla / taslağı at / emekli et) + beş sekme.
 * Editör taslağı store'da — sekme değiştirmek yazılanı kaybettirmez; sayfadan çıkış
 * ve sekme kapatma kaydedilmemiş değişiklikte onay ister.
 */
export function RoleplayDetailScreen({ roleplayId }: { roleplayId: string }) {
  const { detail, error, busy, tab } = useRoleplayDetailStore();
  const editorKey = useRoleplayEditorStore((s) => s.key);
  const form = useRoleplayEditorStore((s) => s.form);
  const baseline = useRoleplayEditorStore((s) => s.baseline);
  const editorDirty = useMemo(() => editorKey === roleplayId && candidateKey(form) !== baseline, [editorKey, roleplayId, form, baseline]);

  useEffect(() => {
    void RoleplayDetailController.load(roleplayId);
  }, [roleplayId]);

  if (error && !detail) return <ErrorState code={error} onRetry={() => void RoleplayDetailController.load(roleplayId)} />;
  if (!detail || detail.roleplay.id !== roleplayId) return <RoleplayDetailSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <UnsavedChangesGuard when={editorDirty} onDiscard={() => RoleplayEditorController.discardLocal()} />
      <RoleplayDetailHeader detail={detail} busy={busy} editorDirty={editorDirty} />

      <Tabs value={tab} onValueChange={(v) => RoleplayDetailController.setTab(v as RoleplayTab)} className="gap-4">
        <TabsList>
          <TabsTrigger value="editor" className="px-3">
            Editor{editorDirty && <span className="size-1.5 rounded-full bg-brand" aria-label="unsaved changes" />}
          </TabsTrigger>
          <TabsTrigger value="preview" className="px-3">Preview</TabsTrigger>
          <TabsTrigger value="revisions" className="px-3">
            Revisions <span className="tabular-nums text-muted-foreground">{detail.revisions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="attempts" className="px-3">
            Attempts <span className="tabular-nums text-muted-foreground">{detail.roleplay.attemptsTotal}</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="px-3">Objective stats</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <RoleplayEditor mode="detail" roleplayId={roleplayId} />
        </TabsContent>
        <TabsContent value="preview">
          <PreviewTab detail={detail} />
        </TabsContent>
        <TabsContent value="revisions">
          <RevisionsTab detail={detail} busy={busy} editorDirty={editorDirty} />
        </TabsContent>
        <TabsContent value="attempts">
          <AttemptsTab roleplayId={roleplayId} />
        </TabsContent>
        <TabsContent value="stats">
          <ObjectiveStatsTab stats={detail.objectiveStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

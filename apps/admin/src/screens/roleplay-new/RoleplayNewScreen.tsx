"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { RoleplayEditor } from "@/components/shared/roleplay/RoleplayEditor";
import { RoleplayPreview } from "@/components/shared/roleplay/RoleplayPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { fadeUp } from "@/lib/motion";
import { candidateKey, parseSpecForm } from "@/lib/roleplayDraft";
import { useRoleplayEditorStore } from "@/stores/useRoleplayEditorStore";
import { SlugField } from "@/screens/roleplay-new/SlugField";

/**
 * Yeni senaryo: kalıcı kimlik + aynı editör + önizleme. Oluşturma revizyon 1'i
 * TASLAK olarak yazar — canlıya çıkış detay sayfasındaki "Publish draft" ile.
 * Başarıda yönlendirme rota dosyasında (`createdId`); sekme seçimi yerel state.
 */
export function RoleplayNewScreen() {
  const key = useRoleplayEditorStore((s) => s.key);
  const form = useRoleplayEditorStore((s) => s.form);
  const baseline = useRoleplayEditorStore((s) => s.baseline);
  const slugTouched = useRoleplayEditorStore((s) => s.slugTouched);
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const parsed = useMemo(() => parseSpecForm(form), [form]);
  const ready = key === "new";
  const dirty = ready && (candidateKey(form) !== baseline || slugTouched);

  useEffect(() => {
    RoleplayEditorController.initNew();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <UnsavedChangesGuard when={dirty} onDiscard={() => RoleplayEditorController.discardLocal()} />
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
        <Link href="/roleplays" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Roleplays
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New role-play</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Creating saves revision 1 as a draft. Students see nothing until you publish it from the detail page.
          </p>
        </div>
      </motion.header>

      {!ready ? (
        <Skeleton className="h-[480px] rounded-xl" />
      ) : (
        <>
          <SlugField />
          <Tabs value={tab} onValueChange={(v) => setTab(v as "editor" | "preview")} className="gap-4">
            <TabsList>
              <TabsTrigger value="editor" className="px-3">Editor</TabsTrigger>
              <TabsTrigger value="preview" className="px-3">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <RoleplayEditor mode="new" />
            </TabsContent>
            <TabsContent value="preview">
              {parsed.ok ? (
                <RoleplayPreview spec={parsed.spec} />
              ) : (
                <EmptyState title="Nothing to preview yet" hint="Fill in the editor — the preview appears once the form is valid." />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

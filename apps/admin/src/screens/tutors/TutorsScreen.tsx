"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TablePagination } from "@/components/shared/TablePagination";
import { TutorsController } from "@/controllers/TutorsController";
import { paginate } from "@/lib/paginate";
import { useTutorsStore } from "@/stores/useTutorsStore";
import { TutorEditorDialog } from "@/screens/tutors/TutorEditorDialog";
import { TutorsSkeleton } from "@/screens/tutors/TutorsSkeleton";
import { TutorsTable } from "@/screens/tutors/TutorsTable";

/**
 * Öğretmenler — kullanıcının onboarding/ayarlarda seçtiği hoca karakteri (ad + 2.5D rig + ses).
 * Liste sunucu sırasıyla (sıra numarası, ad) gelir; sayfalama istemcide. Oluştur/düzenle
 * diyalogda; silme yok — gizlenir (kullanıcı seçimleri korunur).
 */
export function TutorsScreen() {
  const { data, tts, loading, error, page, pageSize, setPage, setPageSize } = useTutorsStore();

  useEffect(() => {
    void TutorsController.load();
  }, []);

  const paged = useMemo(() => paginate(data?.tutors ?? [], page, pageSize), [data, page, pageSize]);
  const defaultTutor = data?.tutors.find((t) => t.isDefault);
  const canCreate = Boolean(data && tts && data.avatars.length > 0);

  return (
    <>
      <PageHeader
        title="Tutors"
        description={
          data && data.tutors.length > 0
            ? `${data.tutors.length} tutor${data.tutors.length === 1 ? "" : "s"}${defaultTutor ? ` · default: ${defaultTutor.name}` : ""}`
            : "Teacher characters users pick during onboarding and in settings: a name, a 2.5D avatar rig and a voice"
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void TutorsController.load()} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => TutorsController.openCreate()} disabled={!canCreate}>
              <Plus data-icon="inline-start" />
              New tutor
            </Button>
          </>
        }
      />

      {error && !data ? (
        <ErrorState code={error} onRetry={() => void TutorsController.load()} />
      ) : !data ? (
        <TutorsSkeleton />
      ) : data.tutors.length === 0 ? (
        <EmptyState
          title="No tutors yet"
          hint="Until a tutor exists, everyone gets the legacy global avatar and the global TTS voice, named “Emma”. The first tutor you create becomes the default."
        />
      ) : (
        <div className="flex flex-col gap-5">
          <TutorsTable key={paged.page} tutors={paged.items} />
          <TablePagination paged={paged} onPage={setPage} onPageSize={setPageSize} noun="tutors" />
        </div>
      )}

      <TutorEditorDialog />
    </>
  );
}

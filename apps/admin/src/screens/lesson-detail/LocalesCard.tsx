"use client";

import type { AdminLessonDetail } from "@glotmate/contracts";
import { LessonDetailController } from "@/controllers/LessonDetailController";
import type { DetailBusy } from "@/stores/useLessonDetailStore";
import { LanguageInput } from "@/screens/lesson-detail/LanguageInput";
import { LocaleRow } from "@/screens/lesson-detail/LocaleRow";

/** Dil paketleri: mevcut satırlar + yeni dil ekleme. Üretim çekirdek+sahne canlı olmadan kapalı. */
export function LocalesCard({ detail, busy }: { detail: AdminLessonDetail; busy: DetailBusy | null }) {
  const live = (s?: string) => s === "ready" || s === "published";
  const canGenerate = live(detail.core?.status) && live(detail.sceneSet?.status);
  const lessonId = detail.lesson.id;

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Language packs</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Native-language narration — explains the core&apos;s claims, cannot add new ones. Stale packs regenerate on
            first open anyway; here you warm them up ahead of time.
          </p>
        </div>
        <LanguageInput
          known={detail.locales.map((l) => l.language)}
          disabled={!canGenerate || busy !== null}
          onSubmit={(lang) => void LessonDetailController.generateLocale(lessonId, lang, false)}
        />
      </div>

      {!canGenerate && (
        <p className="mt-3 text-xs text-muted-foreground">
          To generate a pack, the core and scene set must be <em>ready</em> or <em>published</em>.
        </p>
      )}

      {detail.locales.length > 0 && (
        <ul className="mt-3 divide-y divide-border/60 rounded-lg border border-border/60">
          {detail.locales.map((l) => (
            <LocaleRow
              key={l.id}
              locale={l}
              busy={busy === `locale:${l.language}`}
              disabled={!canGenerate || busy !== null}
              onRefresh={() => void LessonDetailController.generateLocale(lessonId, l.language, true)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import type { AdminLessonDetail } from "@glotmate/contracts";
import { ArrowLeft, Loader2, Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonDetailController } from "@/controllers/LessonDetailController";
import { KIND_LABEL } from "@/lib/labels";
import { fadeUp } from "@/lib/motion";
import type { DetailBusy } from "@/stores/useLessonDetailStore";

/** Başlık + katalog bilgisi (salt okunur — katalog repo'da yaşar) + Yayınla */
export function LessonDetailHeader({ detail, busy }: { detail: AdminLessonDetail; busy: DetailBusy | null }) {
  const { lesson, catalog, core, sceneSet } = detail;
  const canPublish =
    !!core && !!sceneSet && (core.status === "ready" || sceneSet.status === "ready") &&
    ["ready", "published"].includes(core.status) && ["ready", "published"].includes(sceneSet.status);

  return (
    <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
      <Link href="/lessons" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Lessons
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px]">{lesson.level}</Badge>
            <Badge variant="outline" className="font-normal">{KIND_LABEL[lesson.kind]}</Badge>
            <span className="text-xs text-muted-foreground">
              Unit {lesson.unitIndex} · {lesson.unitTitle} · #{lesson.position}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{lesson.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{lesson.focus}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">{lesson.id}</p>

          <dl className="mt-3 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">Target phrases</dt>
            <dd className="flex flex-wrap gap-1">
              {lesson.targetPhrases.map((p) => (
                <code key={p} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{p}</code>
              ))}
            </dd>
            <dt className="text-muted-foreground">Theme hint</dt>
            <dd>{catalog.themeHint}</dd>
          </dl>
        </div>

        <Button
          onClick={() => void LessonDetailController.publish(lesson.id)}
          disabled={!canPublish || busy !== null}
          title={canPublish ? "Publish core + scene set" : "No ready layer to publish"}
        >
          {busy === "publish" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Rocket data-icon="inline-start" />}
          Publish
        </Button>
      </div>
    </motion.header>
  );
}

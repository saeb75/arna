"use client";

import type { AdminSessionDetail } from "@glotmate/contracts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { PHASE_LABEL, SESSION_KIND_LABEL, TRACK_LABEL, TUTOR_LANGUAGE_LABEL, formatDateTime, formatDuration } from "@/lib/labels";
import { fadeUp } from "@/lib/motion";

export function SessionDetailHeader({ session: s, layers }: { session: AdminSessionDetail["session"]; layers: AdminSessionDetail["layers"] }) {
  const title = s.lessonTitle ?? s.roleplayId ?? "Untitled session";
  return (
    <motion.header variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-3">
      <Link href="/sessions" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Sessions
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={s.endedAt ? "secondary" : "outline"}>{s.endedAt ? "Ended" : "Open"}</Badge>
            <Badge variant="outline" className="font-normal">{SESSION_KIND_LABEL[s.kind ?? ""] ?? "Legacy"}</Badge>
            {s.phase && <span className="text-xs text-muted-foreground">{PHASE_LABEL[s.phase]}{s.awaiting ? ` · awaiting ${s.awaiting}` : ""}</span>}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {s.catalogLessonId ? (
              <Link href={`/lessons/${s.catalogLessonId}`} className="hover:underline">{title}</Link>
            ) : (
              title
            )}
            {s.level && <span className="ml-2 font-mono text-base text-muted-foreground">{s.level}</span>}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/users/${s.userId}`} className="font-medium text-foreground hover:underline">
              {s.userEmail ?? s.userName ?? s.userId}
            </Link>
            {s.userName && s.userEmail && ` (${s.userName})`}
            {" · "}
            {formatDateTime(s.startedAt)}
            {s.endedAt && ` → ${formatDateTime(s.endedAt)}`}
            {s.durationSec !== null && ` · ${formatDuration(s.durationSec)}`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {s.track && <>{TRACK_LABEL[s.track] ?? s.track} · </>}
            {s.tutorLanguage && <>{TUTOR_LANGUAGE_LABEL[s.tutorLanguage] ?? s.tutorLanguage} · </>}
            <span className="font-mono text-[11px]">{s.id}</span>
          </p>
          {(layers.coreId || layers.sceneSetId || layers.localeId) && (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
              core {layers.coreId?.slice(0, 8) ?? "—"} · scenes {layers.sceneSetId?.slice(0, 8) ?? "—"} · locale {layers.localeId?.slice(0, 8) ?? "—"}
            </p>
          )}
        </div>
      </div>
    </motion.header>
  );
}

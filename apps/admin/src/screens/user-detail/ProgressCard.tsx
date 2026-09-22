"use client";

import type { AdminUserProgress } from "@glotmate/contracts";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { KIND_LABEL, formatRelative } from "@/lib/labels";
import { ProgressStatusBadge } from "@/screens/user-detail/ProgressStatusBadge";

/** Başlanan dersler (seyrek tablo: satırı olmayan ders hiç açılmamış demek). */
export function ProgressCard({ progress }: { progress: AdminUserProgress[] }) {
  const done = progress.filter((p) => p.status === "completed").length;
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Lesson progress</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {done} completed · {progress.length - done} in progress
        </span>
      </div>
      {progress.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No lessons started yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border/60 rounded-lg border border-border/60">
          {progress.map((p) => (
            <li key={p.catalogLessonId} className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs">
              <Badge variant="outline" className="font-mono text-[10px]">{p.level}</Badge>
              <Link href={`/lessons/${p.catalogLessonId}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                {p.title}
              </Link>
              <span className="text-muted-foreground">{KIND_LABEL[p.kind]}</span>
              <span className="tabular-nums text-muted-foreground">{p.sessionCount} session{p.sessionCount === 1 ? "" : "s"}</span>
              <ProgressStatusBadge status={p.status} />
              <span className="w-24 text-right text-muted-foreground">
                {p.completedAt ? formatRelative(p.completedAt) : formatRelative(p.firstStartedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

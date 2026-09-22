"use client";

import type { AdminUserSession } from "@glotmate/contracts";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";

function durationLabel(start: string, end: string | null): string {
  if (!end) return "open";
  const min = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
  return min < 1 ? "<1 min" : `${min} min`;
}

/** Tek oturum: tür, ders, süre; özet/continuity hook açılır (yerel state — sunum). */
export function SessionRow({ session }: { session: AdminUserSession }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!(session.summary || session.continuityHook || session.errorsObserved);
  const errors = Array.isArray(session.errorsObserved) ? (session.errorsObserved as unknown[]) : [];

  return (
    <li className="text-xs">
      <button
        type="button"
        onClick={() => hasDetail && setOpen((v) => !v)}
        className={cn("flex w-full flex-wrap items-center gap-3 px-3 py-2 text-left", hasDetail && "hover:bg-muted/30")}
        aria-expanded={open}
      >
        <Badge variant="outline" className="font-mono text-[10px] capitalize">{session.kind ?? "—"}</Badge>
        <span className="min-w-0 flex-1 truncate font-medium">{session.lessonTitle ?? session.catalogLessonId ?? "Untitled"}</span>
        <span className="tabular-nums text-muted-foreground">{durationLabel(session.startedAt, session.endedAt)}</span>
        <span className="text-muted-foreground">{formatDateTime(session.startedAt)}</span>
        {hasDetail ? (
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        ) : (
          <span className="w-4 text-center text-muted-foreground/50">·</span>
        )}
      </button>
      {open && hasDetail && (
        <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/20 px-3 py-2">
          {session.summary && <p>{session.summary}</p>}
          {session.continuityHook && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Continuity hook · </span>
              {session.continuityHook}
            </p>
          )}
          {errors.length > 0 && (
            <div>
              <p className="font-medium">Errors observed</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                {errors.map((e, i) => (
                  <li key={i}>{typeof e === "string" ? e : JSON.stringify(e)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

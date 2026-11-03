"use client";

import type { AdminUserSession } from "@glotmate/contracts";
import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SESSION_KIND_LABEL, formatDateTime, formatDuration, formatRelative } from "@/lib/labels";
import { cn } from "@/lib/utils";

/**
 * Tek oturum satırı (+ açılır özet satırı). Roleplay oturumunda senaryo başlığı
 * gösterilir; transkript bağlantısı her satırda. Açık/kapalı yerel state — sunum.
 */
export function UserSessionRow({ session: s }: { session: AdminUserSession }) {
  const [open, setOpen] = useState(false);
  const errors = Array.isArray(s.errorsObserved) ? (s.errorsObserved as unknown[]) : [];
  const hasDetail = !!(s.summary || s.continuityHook || errors.length);
  const title = s.kind === "roleplay" ? (s.roleplayTitle ?? s.roleplayId) : (s.lessonTitle ?? s.catalogLessonId);
  const durationSec = s.endedAt ? Math.max(0, Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000)) : null;

  return (
    <>
      <tr className="border-t border-border/60 text-xs">
        <td className="py-1.5 pr-3">
          <span title={formatDateTime(s.startedAt)}>{formatRelative(s.startedAt)}</span>
        </td>
        <td className="py-1.5 pr-3">
          <Badge variant="outline" className="font-normal">
            {SESSION_KIND_LABEL[s.kind ?? ""] ?? "Legacy"}
          </Badge>
        </td>
        <td className="max-w-xs py-1.5 pr-3">
          <p className="truncate font-medium">{title ?? <span className="text-muted-foreground">Untitled</span>}</p>
        </td>
        <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">{durationSec !== null ? formatDuration(durationSec) : "open"}</td>
        <td className="py-1.5 pr-3">
          {!hasDetail ? (
            <span className="text-muted-foreground/60">—</span>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              {errors.length > 0 ? (
                <span className="text-destructive">
                  {errors.length} error{errors.length === 1 ? "" : "s"}
                </span>
              ) : (
                "summary"
              )}
              <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
          )}
        </td>
        <td className="py-1.5 text-right">
          <Link href={`/sessions/${s.id}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ExternalLink className="size-3.5" />
            transcript
          </Link>
        </td>
      </tr>
      {open && hasDetail && (
        <tr className="text-xs">
          <td colSpan={6} className="pb-2">
            <div className="flex flex-col gap-2 rounded-md bg-muted/30 px-3 py-2">
              {s.summary && <p>{s.summary}</p>}
              {s.continuityHook && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Continuity hook · </span>
                  {s.continuityHook}
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
          </td>
        </tr>
      )}
    </>
  );
}

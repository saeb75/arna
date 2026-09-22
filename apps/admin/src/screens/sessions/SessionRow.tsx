"use client";

import type { AdminSession } from "@glotmate/contracts";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PHASE_LABEL, SESSION_KIND_LABEL, formatDateTime, formatDuration, formatMs, formatRelative, formatUsd } from "@/lib/labels";
import { ease, rowDelay } from "@/lib/motion";

/** Satırın tamamı transkripte gider. Renk: yalnız hata sayısı kırmızı; durum/faz gri. */
export function SessionRow({ session: s, index }: { session: AdminSession; index: number }) {
  const router = useRouter();
  const open = () => router.push(`/sessions/${s.id}`);
  const title = s.lessonTitle ?? s.roleplayId ?? s.catalogLessonId ?? "—";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ease, delay: rowDelay(index) }}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      tabIndex={0}
      role="link"
      className="cursor-pointer border-b transition-colors outline-none last:border-0 hover:bg-muted/30 focus-visible:bg-muted/40"
    >
      <TableCell className="pl-4 text-xs">
        <Tooltip>
          <TooltipTrigger className="text-left">
            <p>{formatRelative(s.startedAt)}</p>
            <p className="text-muted-foreground">{s.durationSec !== null ? formatDuration(s.durationSec) : "open"}</p>
          </TooltipTrigger>
          <TooltipContent>{formatDateTime(s.startedAt)}</TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="text-xs">
        <p className="truncate font-medium">{s.userEmail ?? s.userName ?? s.userId.slice(0, 8)}</p>
        {s.userName && s.userEmail && <p className="truncate text-muted-foreground">{s.userName}</p>}
      </TableCell>
      <TableCell className="max-w-xs text-xs">
        <p className="truncate font-medium">{title}</p>
        <p className="text-muted-foreground">
          {s.level && <span className="font-mono">{s.level} · </span>}
          {SESSION_KIND_LABEL[s.kind ?? ""] ?? "Legacy"}
          {s.track && <span> · {s.track}</span>}
        </p>
      </TableCell>
      <TableCell className="text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={s.endedAt ? "secondary" : "outline"} className="font-normal">
            {s.endedAt ? "Ended" : "Open"}
          </Badge>
          {s.phase && <span className="text-muted-foreground">{PHASE_LABEL[s.phase]}</span>}
          {s.awaiting && <span className="font-mono text-[10px] text-muted-foreground">⟳ {s.awaiting}</span>}
        </div>
      </TableCell>
      <TableCell className="text-xs tabular-nums">
        <span className="font-medium">{s.turnCount}</span>
        <span className="text-muted-foreground"> · {s.userTurnCount} student</span>
        {s.chatTurnCount === 0 && s.turnCount > 0 && <p className="text-muted-foreground">script only</p>}
      </TableCell>
      <TableCell className="text-xs tabular-nums">
        {s.llmCalls === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <>
            <p>
              {s.llmCalls} calls · {formatUsd(s.llmCostUsd)}
            </p>
            <p className="text-muted-foreground">max {s.maxLatencyMs !== null ? formatMs(s.maxLatencyMs) : "—"}</p>
          </>
        )}
      </TableCell>
      <TableCell className="pr-4 text-xs">
        {s.hasSummary ? (
          s.errorCount > 0 ? (
            <span className="text-destructive">{s.errorCount} error{s.errorCount === 1 ? "" : "s"}</span>
          ) : (
            <span className="text-muted-foreground">clean</span>
          )
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>
    </motion.tr>
  );
}

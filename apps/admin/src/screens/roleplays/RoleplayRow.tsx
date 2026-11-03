"use client";

import type { AdminRoleplayRow } from "@glotmate/contracts";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { RatioBar } from "@/components/shared/RatioBar";
import { RoleplayStatusPill } from "@/components/shared/RoleplayStatusPill";
import { StatusPill } from "@/components/shared/StatusPill";
import { TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime, formatRelative } from "@/lib/labels";
import { ease, rowDelay } from "@/lib/motion";

/** Satırın tamamı detaya gider. Taslak = kesik çerçeveli gri hap (renk eklemeden "açık iş"). */
export function RoleplayRow({ row: r, index }: { row: AdminRoleplayRow; index: number }) {
  const router = useRouter();
  const open = () => router.push(`/roleplays/${r.id}`);

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
      <TableCell className="max-w-sm pl-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{r.title}</span>
          {r.hasDraft && (
            <StatusPill tone="neutral" dashed className="h-5 text-[10px]">
              Draft
            </StatusPill>
          )}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/80">
          {r.id} · {r.objectiveCount} objective{r.objectiveCount === 1 ? "" : "s"}
        </p>
      </TableCell>
      <TableCell className="text-xs">{r.category}</TableCell>
      <TableCell>
        <RoleplayStatusPill row={r} />
      </TableCell>
      <TableCell className="text-xs">
        <span className="font-mono font-medium">{r.supportedFrom}+</span>
        <span className="text-muted-foreground"> · rec. </span>
        <span className="font-mono">{r.recommendedFrom}</span>
      </TableCell>
      <TableCell className="text-xs tabular-nums">
        {r.publishedRevision !== null ? <span className="font-mono">r{r.publishedRevision}</span> : <span className="text-muted-foreground/60">—</span>}
      </TableCell>
      <TableCell className="text-xs tabular-nums">
        <span className="font-medium">{r.attempts30d}</span>
        <span className="text-muted-foreground"> · 30d</span>
        <p className="text-muted-foreground">{r.attemptsTotal} total</p>
      </TableCell>
      <TableCell>
        <RatioBar ratio={r.avgCompletion} />
      </TableCell>
      <TableCell className="pr-4 text-xs text-muted-foreground">
        <Tooltip>
          <TooltipTrigger className="text-left">{formatRelative(r.updatedAt)}</TooltipTrigger>
          <TooltipContent>{formatDateTime(r.updatedAt)}</TooltipContent>
        </Tooltip>
      </TableCell>
    </motion.tr>
  );
}

"use client";

import type { AdminLesson } from "@glotmate/contracts";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { KIND_LABEL } from "@/lib/labels";
import { ease, rowDelay } from "@/lib/motion";
import { LayerStatusBadge } from "@/screens/lessons/LayerStatusBadge";
import { LocaleChips } from "@/screens/lessons/LocaleChips";

export function LessonRow({ lesson, index }: { lesson: AdminLesson; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ease, delay: rowDelay(index) }}
      className="border-b transition-colors last:border-0 hover:bg-muted/30"
    >
      <TableCell className="pl-4 text-xs tabular-nums text-muted-foreground">{lesson.position}</TableCell>
      <TableCell className="max-w-md">
        <p className="truncate text-sm font-medium">{lesson.title}</p>
        <p className="truncate text-xs text-muted-foreground">{lesson.focus}</p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{lesson.id}</p>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-normal">
          {KIND_LABEL[lesson.kind]}
        </Badge>
      </TableCell>
      <TableCell>
        <LayerStatusBadge layer={lesson.core} />
      </TableCell>
      <TableCell>
        <LayerStatusBadge layer={lesson.sceneSet} />
      </TableCell>
      <TableCell>
        <LocaleChips locales={lesson.locales} />
      </TableCell>
    </motion.tr>
  );
}

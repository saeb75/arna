"use client";

import { AVATAR_LABELS, type AdminTutor } from "@glotmate/contracts";
import { Pencil } from "lucide-react";
import { motion } from "motion/react";
import { StatusPill } from "@/components/shared/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TutorsController } from "@/controllers/TutorsController";
import { formatDateTime, formatRelative, PROVIDER_LABEL, TUTOR_GENDER_LABEL, TUTOR_STATUS_LABEL } from "@/lib/labels";
import { ease, rowDelay } from "@/lib/motion";

/**
 * Satırın tamamı düzenleme diyaloğunu açar. Renk: aktif = accent hap (öğrenciye görünür),
 * gizli = sönük; varsayılan = nötr dolgu rozet (Admin/Active rozetleriyle aynı dil).
 */
export function TutorRow({ tutor: t, index }: { tutor: AdminTutor; index: number }) {
  const open = () => TutorsController.openEdit(t.id);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ease, delay: rowDelay(index) }}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      tabIndex={0}
      role="button"
      className="cursor-pointer border-b transition-colors outline-none last:border-0 hover:bg-muted/30 focus-visible:bg-muted/40"
    >
      <TableCell className="pl-4">
        <p className="text-sm font-medium">{t.name}</p>
        <p className="font-mono text-[10px] text-muted-foreground/80">{t.id}</p>
      </TableCell>
      <TableCell className="text-xs">{AVATAR_LABELS[t.avatarId] ?? t.avatarId}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{TUTOR_GENDER_LABEL[t.gender]}</TableCell>
      <TableCell className="max-w-xs text-xs">
        <p className="truncate">
          <span className="font-medium">{PROVIDER_LABEL[t.voice.provider]}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="font-mono">{t.voice.voiceId}</span>
        </p>
        <p className="truncate font-mono text-[10px] text-muted-foreground/80">{t.voice.modelId}</p>
      </TableCell>
      <TableCell>
        <StatusPill tone={t.status === "active" ? "accent" : "muted"}>{TUTOR_STATUS_LABEL[t.status]}</StatusPill>
      </TableCell>
      <TableCell>
        {t.isDefault ? <Badge className="h-5 px-1.5 text-[10px]">Default</Badge> : <span className="text-xs text-muted-foreground/60">—</span>}
      </TableCell>
      <TableCell className="text-right text-xs tabular-nums">{t.userCount}</TableCell>
      <TableCell className="text-right text-xs tabular-nums text-muted-foreground">{t.sortOrder}</TableCell>
      <TableCell className="text-xs text-muted-foreground">
        <Tooltip>
          <TooltipTrigger className="text-left">{formatRelative(t.updatedAt)}</TooltipTrigger>
          <TooltipContent>{formatDateTime(t.updatedAt)}</TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="pr-4">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Edit ${t.name}`}
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
        >
          <Pencil />
        </Button>
      </TableCell>
    </motion.tr>
  );
}

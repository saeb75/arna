"use client";

import type { AdminUser } from "@glotmate/contracts";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { TRACK_LABEL, formatRelative, formatUsd, languageName } from "@/lib/labels";
import { ease, rowDelay } from "@/lib/motion";
import { lastActivity } from "@/lib/userFilters";

/** Satırın tamamı detaya gider. Renk: admin rozeti mavi (tek vurgu), geri kalan gri. */
export function UserRow({ user, index }: { user: AdminUser; index: number }) {
  const router = useRouter();
  const open = () => router.push(`/users/${user.id}`);
  const initial = (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase();
  const active = lastActivity(user);

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
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{initial}</span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate text-sm font-medium">
              {user.email ?? <span className="text-muted-foreground">(no email)</span>}
              {user.isAdmin && <Badge className="h-4 px-1.5 text-[10px]">Admin</Badge>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.displayName ?? <span className="font-mono text-[10px]">{user.id}</span>}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {user.hasProfile ? (
          <div className="text-xs">
            <p>
              <span className="font-medium">{user.cefrLevel}</span>
              <span className="text-muted-foreground"> · {TRACK_LABEL[user.track ?? ""] ?? user.track}</span>
            </p>
            <p className="text-muted-foreground">{user.nativeLanguage ? languageName(user.nativeLanguage) : "—"}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Not onboarded</span>
        )}
      </TableCell>
      <TableCell className="text-xs tabular-nums">
        <span className="font-medium">{user.lessonsCompleted}</span>
        <span className="text-muted-foreground"> done · {user.lessonsInProgress} open</span>
      </TableCell>
      <TableCell className="text-xs tabular-nums">
        <span className="font-medium">{user.sessionCount}</span>
        {user.lastSessionAt && <span className="text-muted-foreground"> · last {formatRelative(user.lastSessionAt)}</span>}
      </TableCell>
      <TableCell className="text-right text-xs tabular-nums">{formatUsd(user.llmCostUsd)}</TableCell>
      <TableCell className="pr-4 text-xs text-muted-foreground">{active ? formatRelative(active) : "never"}</TableCell>
    </motion.tr>
  );
}

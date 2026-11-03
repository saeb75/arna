import type { AdminRoleplayAttempt } from "@glotmate/contracts";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { RatioBar } from "@/components/shared/RatioBar";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateTime, formatDuration, formatRelative } from "@/lib/labels";

/** Tek deneme: kullanıcı → detay, ilerleme "done/total" (eşik yok — v1 kararı), oturum → transkript */
export function AttemptRow({ attempt: a }: { attempt: AdminRoleplayAttempt }) {
  const durationSec = a.endedAt ? Math.max(0, Math.round((new Date(a.endedAt).getTime() - new Date(a.startedAt).getTime()) / 1000)) : null;
  return (
    <TableRow>
      <TableCell className="max-w-xs pl-4 text-xs">
        <Link href={`/users/${a.userId}`} className="block truncate font-medium hover:underline">
          {a.userEmail ?? a.userName ?? <span className="font-mono text-muted-foreground">{a.userId.slice(0, 8)}</span>}
        </Link>
        {a.userEmail && a.userName && <p className="truncate text-muted-foreground">{a.userName}</p>}
      </TableCell>
      <TableCell className="font-mono text-xs">r{a.revision}</TableCell>
      <TableCell className="font-mono text-xs">{a.playedLevel}</TableCell>
      <TableCell>
        <RatioBar ratio={a.total > 0 ? a.done / a.total : 0} label={`${a.done}/${a.total}`} />
      </TableCell>
      <TableCell className="text-right text-xs tabular-nums">{a.turns}</TableCell>
      <TableCell className="text-xs">
        <span title={formatDateTime(a.startedAt)}>{formatRelative(a.startedAt)}</span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {durationSec !== null ? <span title={formatDateTime(a.endedAt!)}>after {formatDuration(durationSec)}</span> : "open"}
      </TableCell>
      <TableCell className="pr-4 text-right text-xs">
        <Link href={`/sessions/${a.sessionId}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ExternalLink className="size-3.5" />
          transcript
        </Link>
      </TableCell>
    </TableRow>
  );
}

"use client";

import type { AdminSession } from "@glotmate/contracts";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SessionRow } from "@/screens/sessions/SessionRow";

export function SessionsTable({ sessions }: { sessions: AdminSession[] }) {
  if (sessions.length === 0) {
    return <EmptyState title="No sessions match the filter" hint="Try loosening the search, status or toggles." />;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-36 pl-4">Started</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Lesson / role-play</TableHead>
            <TableHead className="w-40">Status</TableHead>
            <TableHead className="w-28">Turns</TableHead>
            <TableHead className="w-40">LLM</TableHead>
            <TableHead className="w-24 pr-4">Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((s, i) => (
            <SessionRow key={s.id} session={s} index={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

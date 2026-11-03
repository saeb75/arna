"use client";

import type { AdminRoleplayRow } from "@glotmate/contracts";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleplayRow } from "@/screens/roleplays/RoleplayRow";

export function RoleplaysTable({ rows, filtered }: { rows: AdminRoleplayRow[]; filtered: boolean }) {
  if (rows.length === 0) {
    return filtered ? (
      <EmptyState title="No role-plays match the filter" hint="Try loosening the search, status or category." />
    ) : (
      <EmptyState title="No role-plays yet" hint="Create the first scenario with “New roleplay”." />
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Role-play</TableHead>
            <TableHead className="w-28">Category</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-28">Levels</TableHead>
            <TableHead className="w-24">Published</TableHead>
            <TableHead className="w-28">Attempts</TableHead>
            <TableHead className="w-36">Avg. completion</TableHead>
            <TableHead className="w-28 pr-4">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <RoleplayRow key={r.id} row={r} index={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

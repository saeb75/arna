"use client";

import type { AdminUser } from "@glotmate/contracts";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRow } from "@/screens/users/UserRow";

export function UsersTable({ users }: { users: AdminUser[] }) {
  if (users.length === 0) {
    return <EmptyState title="No users match the filter" hint="Try loosening the search or the toggles." />;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Account</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead className="w-28">Lessons</TableHead>
            <TableHead className="w-36">Sessions</TableHead>
            <TableHead className="w-24 text-right">LLM cost</TableHead>
            <TableHead className="w-32 pr-4">Last active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u, i) => (
            <UserRow key={u.id} user={u} index={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

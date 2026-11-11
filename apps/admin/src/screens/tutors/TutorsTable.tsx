"use client";

import type { AdminTutor } from "@glotmate/contracts";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TutorRow } from "@/screens/tutors/TutorRow";

export function TutorsTable({ tutors }: { tutors: AdminTutor[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Name</TableHead>
            <TableHead>Avatar rig</TableHead>
            <TableHead className="w-20">Gender</TableHead>
            <TableHead>Voice</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-20">Default</TableHead>
            <TableHead className="w-20 text-right">Users</TableHead>
            <TableHead className="w-20 text-right">Order</TableHead>
            <TableHead className="w-28">Updated</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tutors.map((t, i) => (
            <TutorRow key={t.id} tutor={t} index={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

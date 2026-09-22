"use client";

import type { AdminLesson } from "@glotmate/contracts";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { groupByUnit } from "@/lib/lessonFilters";
import { LessonRow } from "@/screens/lessons/LessonRow";
import { UnitGroupRow } from "@/screens/lessons/UnitGroupRow";

/** Ünite ayraçlı tablo. Ebeveyn `key={level}` verir: seviye değişince stagger yeniden oynar. */
export function LessonsTable({ lessons }: { lessons: AdminLesson[] }) {
  if (lessons.length === 0) {
    return <EmptyState title="No lessons match the filter" hint="Try loosening the search or the layer filter." />;
  }

  let index = 0;
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 pl-4">#</TableHead>
            <TableHead>Lesson</TableHead>
            <TableHead className="w-24">Type</TableHead>
            <TableHead className="w-32">Core</TableHead>
            <TableHead className="w-32">Scene set</TableHead>
            <TableHead>Language packs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupByUnit(lessons).map((g) => (
            <UnitGroupRow key={g.unitIndex} unitIndex={g.unitIndex} title={g.unitTitle} count={g.lessons.length}>
              {g.lessons.map((l) => (
                <LessonRow key={l.id} lesson={l} index={index++} />
              ))}
            </UnitGroupRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

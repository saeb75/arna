"use client";

import { LESSON_KINDS, type LessonKind } from "@glotmate/contracts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KIND_LABEL, LAYER_FILTER_LABEL } from "@/lib/labels";
import { useLessonsStore, type LayerFilter } from "@/stores/useLessonsStore";

const LAYER_FILTERS = Object.keys(LAYER_FILTER_LABEL) as LayerFilter[];

export function LessonsToolbar({ visibleCount, totalCount }: { visibleCount: number; totalCount: number }) {
  const filters = useLessonsStore((s) => s.filters);
  const setFilters = useLessonsStore((s) => s.setFilters);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          placeholder="Ders, focus veya ünite ara…"
          className="pl-8"
        />
      </div>

      <Tabs value={filters.kind} onValueChange={(v) => setFilters({ kind: v as LessonKind | "all" })}>
        <TabsList>
          <TabsTrigger value="all">Hepsi</TabsTrigger>
          {LESSON_KINDS.map((k) => (
            <TabsTrigger key={k} value={k}>
              {KIND_LABEL[k]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Select
        value={filters.layer}
        onValueChange={(v) => setFilters({ layer: v as LayerFilter })}
        items={LAYER_FILTERS.map((k) => ({ value: k, label: LAYER_FILTER_LABEL[k] }))}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LAYER_FILTERS.map((k) => (
            <SelectItem key={k} value={k}>
              {LAYER_FILTER_LABEL[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
        {visibleCount} / {totalCount} ders
      </span>
    </div>
  );
}

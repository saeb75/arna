"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RoleplaySort, RoleplayStatusFilter } from "@/lib/roleplayFilters";
import { useRoleplaysStore } from "@/stores/useRoleplaysStore";

const STATUS_ITEMS: { value: RoleplayStatusFilter; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "retired", label: "Retired" },
];

const SORT_ITEMS: { value: RoleplaySort; label: string }[] = [
  { value: "title", label: "Title A–Z" },
  { value: "attempts30d", label: "Most attempts (30d)" },
  { value: "attemptsTotal", label: "Most attempts (all time)" },
  { value: "completion", label: "Lowest completion" },
  { value: "updated", label: "Recently updated" },
];

/** Filtre/sıra değişimi sayfayı 1'e alır (store) */
export function RoleplaysToolbar({
  categories,
  visibleCount,
  totalCount,
}: {
  categories: string[];
  visibleCount: number;
  totalCount: number;
}) {
  const filters = useRoleplaysStore((s) => s.filters);
  const sort = useRoleplaysStore((s) => s.sort);
  const setFilters = useRoleplaysStore((s) => s.setFilters);
  const setSort = useRoleplaysStore((s) => s.setSort);
  const categoryItems = [{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c, label: c }))];

  const select = <T extends string>(value: T, items: { value: T; label: string }[], onChange: (v: T) => void, width: string) => (
    <Select value={value} onValueChange={(v) => onChange(v as T)} items={items}>
      <SelectTrigger className={width}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          placeholder="Search title, id or category…"
          className="pl-8"
        />
      </div>
      {select(filters.status, STATUS_ITEMS, (status) => setFilters({ status }), "w-32")}
      {select(filters.category, categoryItems, (category) => setFilters({ category }), "w-40")}
      {select(sort, SORT_ITEMS, setSort, "w-48")}
      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
        {visibleCount} / {totalCount} role-plays
      </span>
    </div>
  );
}

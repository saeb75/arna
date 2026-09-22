"use client";

import { CEFR_LEVELS, type CefrLevel } from "@glotmate/contracts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useUsersStore } from "@/stores/useUsersStore";

const LEVEL_ITEMS = [{ value: "all", label: "All levels" }, ...CEFR_LEVELS.map((l) => ({ value: l, label: l }))];

export function UsersToolbar({ visibleCount, totalCount }: { visibleCount: number; totalCount: number }) {
  const filters = useUsersStore((s) => s.filters);
  const setFilters = useUsersStore((s) => s.setFilters);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          placeholder="Search email, name or id…"
          className="pl-8"
        />
      </div>

      <Select value={filters.level} onValueChange={(v) => setFilters({ level: v as CefrLevel | "all" })} items={LEVEL_ITEMS}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEVEL_ITEMS.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Toggle size="sm" variant="outline" pressed={filters.onlyActive} onPressedChange={(v) => setFilters({ onlyActive: v })}>
        Active 30d
      </Toggle>
      <Toggle size="sm" variant="outline" pressed={filters.onlyAdmins} onPressedChange={(v) => setFilters({ onlyAdmins: v })}>
        Admins
      </Toggle>

      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
        {visibleCount} / {totalCount} users
      </span>
    </div>
  );
}

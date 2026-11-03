"use client";

import { CEFR_LEVELS } from "@glotmate/contracts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useUsersStore, type UserFilters, type UserSort } from "@/stores/useUsersStore";

const LEVEL_ITEMS: { value: UserFilters["level"]; label: string }[] = [
  { value: "all", label: "All levels" },
  ...CEFR_LEVELS.map((l) => ({ value: l, label: l })),
];
const PLAN_ITEMS: { value: UserFilters["plan"]; label: string }[] = [
  { value: "all", label: "All plans" },
  { value: "pro", label: "Pro" },
  { value: "free", label: "Free" },
];
const ACCOUNT_ITEMS: { value: UserFilters["account"]; label: string }[] = [
  { value: "all", label: "All accounts" },
  { value: "registered", label: "Registered" },
  { value: "guest", label: "Guests" },
];
const SORT_ITEMS: { value: UserSort; label: string }[] = [
  { value: "active", label: "Last active" },
  { value: "newest", label: "Newest accounts" },
  { value: "cost", label: "Highest LLM cost" },
  { value: "sessions", label: "Most sessions" },
  { value: "email", label: "Email A–Z" },
];

/** Filtre/sıra değişimi sayfayı 1'e alır (store) */
export function UsersToolbar({ visibleCount, totalCount }: { visibleCount: number; totalCount: number }) {
  const filters = useUsersStore((s) => s.filters);
  const sort = useUsersStore((s) => s.sort);
  const setFilters = useUsersStore((s) => s.setFilters);
  const setSort = useUsersStore((s) => s.setSort);

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
          placeholder="Search email, name or id…"
          className="pl-8"
        />
      </div>

      {select(filters.level, LEVEL_ITEMS, (level) => setFilters({ level }), "w-28")}
      {select(filters.plan, PLAN_ITEMS, (plan) => setFilters({ plan }), "w-28")}
      {select(filters.account, ACCOUNT_ITEMS, (account) => setFilters({ account }), "w-36")}
      {select(sort, SORT_ITEMS, setSort, "w-40")}

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

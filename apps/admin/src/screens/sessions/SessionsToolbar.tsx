"use client";

import { CEFR_LEVELS, type CefrLevel } from "@glotmate/contracts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { SessionsController } from "@/controllers/SessionsController";
import { SESSION_LIMITS, useSessionsStore, type SessionFilters, type SessionSort } from "@/stores/useSessionsStore";

const KIND_ITEMS = [
  { value: "all", label: "All kinds" },
  { value: "lesson", label: "Lessons" },
  { value: "roleplay", label: "Role-plays" },
];
const STATUS_ITEMS = [
  { value: "all", label: "Any status" },
  { value: "open", label: "Open" },
  { value: "ended", label: "Ended" },
];
const LEVEL_ITEMS = [{ value: "all", label: "All levels" }, ...CEFR_LEVELS.map((l) => ({ value: l, label: l }))];
const SORT_ITEMS: { value: SessionSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "longest", label: "Most turns" },
  { value: "costliest", label: "Highest cost" },
  { value: "slowest", label: "Slowest LLM call" },
];
const LIMIT_ITEMS = SESSION_LIMITS.map((n) => ({ value: String(n), label: `Last ${n}` }));

export function SessionsToolbar({ visibleCount, loadedCount }: { visibleCount: number; loadedCount: number }) {
  const { filters, sort, limit } = useSessionsStore();
  const setFilters = useSessionsStore((s) => s.setFilters);
  const setSort = useSessionsStore((s) => s.setSort);

  const select = <T extends string>(
    value: T,
    items: { value: T; label: string }[],
    onChange: (v: T) => void,
    width = "w-36",
  ) => (
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            placeholder="Search user, lesson, role-play or session id…"
            className="pl-8"
          />
        </div>
        {select(filters.kind, KIND_ITEMS as { value: SessionFilters["kind"]; label: string }[], (kind) => setFilters({ kind }), "w-32")}
        {select(filters.status, STATUS_ITEMS as { value: SessionFilters["status"]; label: string }[], (status) => setFilters({ status }), "w-32")}
        {select(filters.level, LEVEL_ITEMS as { value: CefrLevel | "all"; label: string }[], (level) => setFilters({ level }), "w-28")}
        <Toggle size="sm" variant="outline" pressed={filters.onlyErrors} onPressedChange={(v) => setFilters({ onlyErrors: v })}>
          With errors
        </Toggle>
        <Toggle size="sm" variant="outline" pressed={filters.onlyChat} onPressedChange={(v) => setFilters({ onlyChat: v })}>
          Has chat turns
        </Toggle>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {select(sort, SORT_ITEMS, setSort, "w-44")}
        {select(String(limit), LIMIT_ITEMS, (v) => void SessionsController.setLimit(Number(v) as (typeof SESSION_LIMITS)[number]), "w-28")}
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {visibleCount} / {loadedCount} sessions
        </span>
      </div>
    </div>
  );
}

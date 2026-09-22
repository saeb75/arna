"use client";

import { CEFR_LEVELS, SESSION_SORTS, type AdminSessionsQuery } from "@glotmate/contracts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { SessionsController } from "@/controllers/SessionsController";
import { useSessionsStore } from "@/stores/useSessionsStore";

const KIND_ITEMS: { value: AdminSessionsQuery["kind"]; label: string }[] = [
  { value: "all", label: "All kinds" },
  { value: "lesson", label: "Lessons" },
  { value: "roleplay", label: "Role-plays" },
];
const STATUS_ITEMS: { value: AdminSessionsQuery["status"]; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "open", label: "Open" },
  { value: "ended", label: "Ended" },
];
const LEVEL_ITEMS: { value: AdminSessionsQuery["level"]; label: string }[] = [
  { value: "all", label: "All levels" },
  ...CEFR_LEVELS.map((l) => ({ value: l, label: l })),
];
const SORT_LABEL: Record<AdminSessionsQuery["sort"], string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  longest: "Most turns",
  costliest: "Highest cost",
  slowest: "Slowest LLM call",
};
const SORT_ITEMS = SESSION_SORTS.map((s) => ({ value: s, label: SORT_LABEL[s] }));

/** Her değişiklik sunucuya gider (controller sayfayı 1'e alır); arama debounce'lu. */
export function SessionsToolbar({ total }: { total: number }) {
  const query = useSessionsStore((s) => s.query);

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
          value={query.q}
          onChange={(e) => SessionsController.setSearch(e.target.value)}
          placeholder="Search user, lesson, role-play or session id…"
          className="pl-8"
        />
      </div>
      {select(query.kind, KIND_ITEMS, (kind) => SessionsController.setQuery({ kind }), "w-32")}
      {select(query.status, STATUS_ITEMS, (status) => SessionsController.setQuery({ status }), "w-32")}
      {select(query.level, LEVEL_ITEMS, (level) => SessionsController.setQuery({ level }), "w-28")}
      {select(query.sort, SORT_ITEMS, (sort) => SessionsController.setQuery({ sort }), "w-44")}
      <Toggle size="sm" variant="outline" pressed={query.onlyErrors} onPressedChange={(v) => SessionsController.setQuery({ onlyErrors: v })}>
        With errors
      </Toggle>
      <Toggle size="sm" variant="outline" pressed={query.onlyChat} onPressedChange={(v) => SessionsController.setQuery({ onlyChat: v })}>
        Has chat turns
      </Toggle>
      <span className="ml-auto text-xs tabular-nums text-muted-foreground">{total} matching</span>
    </div>
  );
}

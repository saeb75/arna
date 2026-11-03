"use client";

import { CEFR_LEVELS, type CefrLevel } from "@glotmate/contracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ITEMS = CEFR_LEVELS.map((l) => ({ value: l, label: l }));

export function LevelSelect({
  id,
  value,
  onChange,
  invalid = false,
  disabled = false,
  className = "w-24",
}: {
  id?: string;
  value: CefrLevel;
  onChange: (level: CefrLevel) => void;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CefrLevel)} items={ITEMS} disabled={disabled}>
      <SelectTrigger id={id} className={className} aria-invalid={invalid || undefined}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ITEMS.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { CEFR_LEVELS, type CefrLevel } from "@glotmate/contracts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLessonsStore } from "@/stores/useLessonsStore";

export function LevelTabs() {
  const level = useLessonsStore((s) => s.filters.level);
  const setFilters = useLessonsStore((s) => s.setFilters);
  return (
    <Tabs value={level} onValueChange={(v) => setFilters({ level: v as CefrLevel })}>
      <TabsList>
        {CEFR_LEVELS.map((l) => (
          <TabsTrigger key={l} value={l} className="px-4">
            {l}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

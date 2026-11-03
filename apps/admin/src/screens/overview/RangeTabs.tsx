"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewController } from "@/controllers/OverviewController";
import type { OverviewDays } from "@/services/AdminOverviewService";
import { useOverviewStore } from "@/stores/useOverviewStore";

const RANGES: { value: OverviewDays; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export function RangeTabs() {
  const days = useOverviewStore((s) => s.days);
  return (
    <Tabs value={String(days)} onValueChange={(v) => OverviewController.setDays(Number(v) as OverviewDays)}>
      <TabsList>
        {RANGES.map((r) => (
          <TabsTrigger key={r.value} value={String(r.value)} className="px-3">
            {r.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

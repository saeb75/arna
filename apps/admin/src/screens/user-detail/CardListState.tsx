"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorLabel } from "@/lib/labels";

/** Kart içi sunucu-sayfalı liste için yükleniyor / hata durumu (tam ekran ErrorState kartı ezmesin) */
export function CardListState({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        <span>{errorLabel(error)}</span>
        <Button variant="outline" size="xs" onClick={onRetry}>
          <RotateCcw data-icon="inline-start" />
          Retry
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}

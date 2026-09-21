"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorLabel } from "@/lib/labels";

/** Store'daki hata KODUNU alır; metne burada çevirir; tekrar denemeyi controller'a bırakır */
export function ErrorState({ code, onRetry }: { code: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center">
      <AlertTriangle className="size-6 text-destructive" />
      <p className="text-sm">{errorLabel(code)}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCcw data-icon="inline-start" />
        Tekrar dene
      </Button>
    </div>
  );
}

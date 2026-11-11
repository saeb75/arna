import type { AdminTranscriptTurn, DrillTurn } from "@glotmate/contracts";
import { Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/labels";
import { cn } from "@/lib/utils";

/**
 * Oyun bloğu cevabı — sohbet balonu DEĞİL, kompakt satır: soru, öğrencinin cevabı ve
 * (yanlışsa) doğrusu tek bakışta. Doğru = ember onay; yanlış = kesik çerçeve + gri ✕
 * (ilke: kırmızı yalnız `failed`/hata — yanlış cevap sistem hatası değildir).
 */
export function DrillTurnRow({ turn: t, drill: d }: { turn: AdminTranscriptTurn; drill: DrillTurn }) {
  return (
    <div className="flex justify-end">
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "flex w-full max-w-[78%] items-start gap-2.5 rounded-xl border px-3 py-2 text-left text-sm",
            d.ok ? "border-border/60 bg-muted/40" : "border-dashed border-border",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
              d.ok ? "bg-brand text-brand-foreground" : "border border-border text-muted-foreground",
            )}
          >
            {d.ok ? <Check className="size-3" /> : <X className="size-3" />}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-[10px] text-muted-foreground">{d.type}</span>
            {d.prompt && <span className="text-muted-foreground">{d.prompt}</span>}
            <span className={cn("font-medium", !d.ok && "line-through decoration-muted-foreground/60")}>{d.answer}</span>
            {d.expected && (
              <span className="text-xs">
                <span className="text-muted-foreground">expected </span>
                {d.expected}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>{formatDateTime(t.createdAt)}</TooltipContent>
      </Tooltip>
    </div>
  );
}

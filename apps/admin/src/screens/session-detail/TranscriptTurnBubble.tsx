import type { AdminTranscriptTurn } from "@glotmate/contracts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime, formatMs } from "@/lib/labels";
import { cn } from "@/lib/utils";

/**
 * Tek tur. Öğrenci sağda (mavi dolgu — tek vurgu), hoca solda (gri). Script
 * satırı kesik çerçeve + "script" etiketi: bug avında "bunu LLM mi söyledi,
 * şablon mu?" sorusu ilk sorudur. RichText varsa `en` parçalar kalın.
 */
export function TranscriptTurnBubble({ turn: t, hit }: { turn: AdminTranscriptTurn; hit: boolean }) {
  const student = t.role === "user";
  return (
    <div className={cn("flex", student ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[78%] flex-col gap-1", student ? "items-end" : "items-start")}>
        <Tooltip>
          <TooltipTrigger
            className={cn(
              "rounded-2xl px-3.5 py-2 text-left text-sm leading-relaxed",
              student ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground",
              t.source === "script" && "border border-dashed border-border bg-transparent text-foreground",
              hit && "ring-2 ring-primary/40",
            )}
          >
            {t.runs ? (
              t.runs.map((r, i) => (
                <span key={i} className={cn(r.lang === "en" && !student && "font-medium", r.emphasis && "underline underline-offset-2")}>
                  {r.text}
                </span>
              ))
            ) : (
              t.text
            )}
          </TooltipTrigger>
          <TooltipContent>{formatDateTime(t.createdAt)}</TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
          <span>{student ? "student" : "tutor"}</span>
          <span className="font-mono">{t.source}</span>
          {t.latencyMs !== null && t.source === "chat" && <span>{formatMs(t.latencyMs)}</span>}
          {hit && <span className="text-primary">target used</span>}
        </div>
      </div>
    </div>
  );
}

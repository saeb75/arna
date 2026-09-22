import { PROGRESS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

/** Ders ilerleme durumu: tamamlanan mavi (tek vurgu), süren gri — renk ilkesi */
export function ProgressStatusBadge({ status }: { status: "in_progress" | "completed" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium",
        status === "completed" ? "bg-primary/10 text-primary" : "bg-muted text-foreground",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {PROGRESS_LABEL[status]}
    </span>
  );
}

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-4.5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">GlotMate</span>
          <span className="block text-[11px] text-muted-foreground">Admin</span>
        </span>
      )}
    </div>
  );
}

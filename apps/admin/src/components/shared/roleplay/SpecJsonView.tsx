import { cn } from "@/lib/utils";

/** Salt okunur spec JSON'u — editörün "JSON" görünümü ve revizyon diyaloğu */
export function SpecJsonView({ value, className }: { value: unknown; className?: string }) {
  return (
    <pre
      className={cn(
        "max-h-[560px] overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words",
        className,
      )}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

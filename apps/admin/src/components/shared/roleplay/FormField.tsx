import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Editör alanı: etiket + kontrol + (opsiyonel) karakter sayacı + ipucu + alan hataları.
 * Hatalar istemci kapısından (şema + yapısal kurallar) gelir ve İngilizcedir;
 * sunucu lint raporu ayrı panelde durur.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  issues,
  count,
  optional = false,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  issues?: string[];
  /** Karakter sayacı — sınıra yaklaşınca belirginleşir, aşınca kırmızı */
  count?: { value: number; max: number };
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const over = count ? count.value > count.max : false;
  const near = count ? count.value >= count.max * 0.9 : false;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs">
          {label}
          {optional && <span className="font-normal text-muted-foreground">optional</span>}
        </Label>
        {count && (
          <span
            className={cn(
              "text-[11px] tabular-nums",
              over ? "font-medium text-destructive" : near ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {count.value} / {count.max}
          </span>
        )}
      </div>
      {children}
      {issues && issues.length > 0 ? (
        <ul className="flex flex-col gap-0.5 text-[11px] text-destructive">
          {issues.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : (
        hint && <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

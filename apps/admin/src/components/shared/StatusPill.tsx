import { cn } from "@/lib/utils";

/**
 * Durum hapı — renk ilkesinin tek kaynağı (LayerStatusBadge ile aynı tonlar):
 *   accent = yayında/canlı (tek vurgu ember) · neutral = ara durum (taslak) ·
 *   muted = emekli/pasif · destructive = yalnız başarısız.
 * Yeni ton EKLENMEZ; ayrım gerekiyorsa biçim (kesik çerçeve) kullanılır.
 */
export type StatusTone = "accent" | "neutral" | "muted" | "destructive";

const TONE: Record<StatusTone, string> = {
  accent: "bg-brand/10 text-brand",
  neutral: "bg-muted text-foreground",
  muted: "text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatusPill({
  tone,
  children,
  dashed = false,
  icon,
  title,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  /** Kesik çerçeve — renk eklemeden "geçici/açık" anlamı */
  dashed?: boolean;
  /** Nokta yerine ikon (ör. Pro tacı) */
  icon?: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
        TONE[tone],
        dashed && "border border-dashed border-border",
        className,
      )}
    >
      {icon ?? <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

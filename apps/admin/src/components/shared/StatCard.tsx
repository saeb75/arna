"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

/**
 * Sayı değişince eskiden yeniye kısa sayar (~350ms). Sayaç DEĞER için, dekor
 * için değil: seviye değiştiğinde farkı gözle yakalatır. Renk yok — sayı
 * `foreground`, bağlam `hint` metninde (renk ilkesi).
 */
export function StatCard({
  label,
  value,
  total,
  hint,
  format,
}: {
  label: string;
  value: number;
  total?: number;
  hint?: string;
  /** Varsayılan tam sayı; para gibi değerler için biçimleyici verilir */
  format?: (v: number) => string;
}) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => (format ? format(v) : Math.round(v).toString()));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.35, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, value]);

  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-xs">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <motion.span className="text-2xl font-semibold tabular-nums tracking-tight">{rounded}</motion.span>
        {total !== undefined && <span className="text-sm text-muted-foreground">/ {total}</span>}
      </div>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

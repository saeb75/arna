"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Sayı değişince eskiden yeniye kısa sayar (~350ms). Sayaç DEĞER için, dekor
 * için değil: seviye değiştiğinde farkı gözle yakalatır.
 */
export function StatCard({
  label,
  value,
  total,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  total?: number;
  hint?: string;
  tone?: "default" | "success" | "warning";
}) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.35, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, value]);

  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <motion.span
          className={cn(
            "text-2xl font-semibold tabular-nums tracking-tight",
            tone === "success" && "text-emerald-500",
            tone === "warning" && "text-amber-500",
          )}
        >
          {rounded}
        </motion.span>
        {total !== undefined && <span className="text-sm text-muted-foreground">/ {total}</span>}
      </div>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

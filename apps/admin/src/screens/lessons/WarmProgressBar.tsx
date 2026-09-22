"use client";

import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { LocaleWarmController } from "@/controllers/LocaleWarmController";
import { errorLabel } from "@/lib/labels";
import { ease } from "@/lib/motion";
import { useLocaleWarmStore } from "@/stores/useLocaleWarmStore";

/** Toplu ısıtma ilerlemesi — tablo üstünde; bitince sonuç + kapat, sürerken durdur. */
export function WarmProgressBar() {
  const { running, cancelRequested, level, languages, total, done, failures } = useLocaleWarmStore();
  const visible = running || total > 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={ease}
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-xs">
            <Progress value={pct} className="items-center">
              <ProgressLabel className="flex items-center gap-2 text-xs">
                {running && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                {level} · {languages.map((l) => l.toUpperCase()).join(", ")} language packs
                {running && cancelRequested && <span className="text-muted-foreground">— stopping…</span>}
                {!running && <span className="text-muted-foreground">— done</span>}
              </ProgressLabel>
              <ProgressValue className="text-xs">
                {() => `${done} / ${total}${failures.length ? ` · ${failures.length} failed` : ""}`}
              </ProgressValue>
              {running ? (
                <Button variant="ghost" size="xs" onClick={() => LocaleWarmController.cancel()} disabled={cancelRequested}>
                  Stop
                </Button>
              ) : (
                <Button variant="ghost" size="icon-xs" onClick={() => LocaleWarmController.dismiss()} aria-label="Close">
                  <X />
                </Button>
              )}
            </Progress>

            {failures.length > 0 && (
              <ul className="max-h-24 overflow-auto text-[11px] text-destructive">
                {failures.map((f, i) => (
                  <li key={i}>
                    <span className="font-mono">{f.lessonId}</span> · {f.language.toUpperCase()} — {errorLabel(f.code)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

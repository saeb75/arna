"use client";

import type { AdminLesson } from "@glotmate/contracts";
import { Flame } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LocaleWarmController } from "@/controllers/LocaleWarmController";
import { knownLanguages, missingLocales } from "@/lib/lessonFilters";
import { cn } from "@/lib/utils";
import { useLocaleWarmStore } from "@/stores/useLocaleWarmStore";

/**
 * Seviye bazlı toplu ısıtma: dil seç → eksik+bayat paket sayısını gör → başlat.
 * Seçim yerel state (sunum); iş controller'da, ilerleme store'da.
 */
export function WarmLocalesDialog({ level, lessons, allLessons }: { level: string; lessons: AdminLesson[]; allLessons: AdminLesson[] }) {
  const running = useLocaleWarmStore((s) => s.running);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState("");

  const known = useMemo(() => knownLanguages(allLessons), [allLessons]);
  const extraCode = extra.trim().toLowerCase();
  const extraValid = /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(extraCode) && !known.includes(extraCode);
  const languages = useMemo(
    () => [...selected, ...(extraValid ? [extraCode] : [])],
    [selected, extraValid, extraCode],
  );
  const targets = useMemo(() => missingLocales(lessons, languages), [lessons, languages]);
  const forced = targets.filter((t) => t.force).length;

  function toggle(lang: string) {
    setSelected((s) => (s.includes(lang) ? s.filter((x) => x !== lang) : [...s, lang]));
  }

  function start() {
    setOpen(false);
    void LocaleWarmController.start(level, lessons, languages);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={running}>
            <Flame data-icon="inline-start" />
            Warm language packs
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{level} — warm language packs</DialogTitle>
          <DialogDescription>
            Generates packs for lessons that are missing, stale or failed in the selected languages. Only lessons whose
            core and scene set are ready/published. Runs from this tab sequentially — keep it open.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {known.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggle(lang)}
                className={cn(
                  "h-7 rounded-md border px-2.5 font-mono text-xs uppercase transition-colors",
                  selected.includes(lang)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {lang}
              </button>
            ))}
            <Input
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="+ new code"
              className="h-7 w-28 font-mono text-xs"
              aria-invalid={extraCode.length > 0 && !extraValid}
            />
          </div>

          <p className="text-sm">
            {languages.length === 0 ? (
              <span className="text-muted-foreground">Pick a language.</span>
            ) : targets.length === 0 ? (
              <span className="text-muted-foreground">No missing or stale packs for these languages.</span>
            ) : (
              <>
                <span className="font-medium tabular-nums">{targets.length}</span> packs to generate
                {forced > 0 && <span className="text-muted-foreground"> ({forced} stale/failed regenerated)</span>}
                <span className="text-muted-foreground"> · ~{Math.ceil((targets.length * 15) / 60 / 2)} min</span>
              </>
            )}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={start} disabled={targets.length === 0}>
            <Flame data-icon="inline-start" />
            Start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

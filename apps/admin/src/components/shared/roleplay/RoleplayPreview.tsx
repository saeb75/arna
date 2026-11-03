"use client";

import {
  CEFR_LEVELS,
  MIN_ACTIVE_OBJECTIVES,
  activeComplications,
  resolvePlayedLevel,
  type CefrLevel,
  type RoleplaySpec,
} from "@glotmate/contracts";
import { ArrowUpRight, Circle, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { levelCoverage } from "@/lib/roleplayDraft";
import { cn } from "@/lib/utils";

/**
 * "Öğrenci ne görür?" — seviye seçilince sunucunun AYNI saf fonksiyonları
 * (`resolvePlayedLevel`, `activeComplications`) çalışır: oynanacak seviye, yükseltme
 * notu, aktif hedefler, oynanacak komplikasyon (seviyede İLK aktif olan), persona,
 * sahne, açılış. Seçili seviye yerel state — sunum.
 */
export function RoleplayPreview({ spec, note }: { spec: RoleplaySpec; note?: string }) {
  const [level, setLevel] = useState<CefrLevel>(spec.recommendedFrom);
  const decision = resolvePlayedLevel(spec, level);
  const complications = activeComplications(spec, decision.level);
  const played = complications[0] ?? null;
  const coverage = levelCoverage(spec);
  const activeIds = new Set(decision.objectives.map((o) => o.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">Learner level</span>
          <Tabs value={level} onValueChange={(v) => setLevel(v as CefrLevel)}>
            <TabsList>
              {CEFR_LEVELS.map((l) => (
                <TabsTrigger key={l} value={l} className="px-3">
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]" aria-label="Active objectives per level">
        {coverage.map((c) => (
          <span
            key={c.level}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-md border px-2 tabular-nums",
              c.level === level ? "border-brand/40 bg-brand/10 text-brand" : "border-border text-muted-foreground",
              c.active < MIN_ACTIVE_OBJECTIVES && "border-dashed",
            )}
            title={c.active < MIN_ACTIVE_OBJECTIVES ? `Fewer than ${MIN_ACTIVE_OBJECTIVES} objectives — raised to ${spec.supportedFrom}` : undefined}
          >
            <span className="font-mono font-medium">{c.level}</span> {c.active} active
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-normal">{spec.category}</Badge>
            <Badge variant="outline" className="font-mono">played at {decision.level}</Badge>
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{spec.title}</h3>
          {decision.raised && (
            <p className="flex items-start gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-foreground" />
              <span>
                Raised from {level}: fewer than {MIN_ACTIVE_OBJECTIVES} objectives are active at {level}, so the scenario is
                played at its supported level ({decision.level}). The brief tells the student.
              </span>
            </p>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Persona</dt>
            <dd>
              <span className="font-medium">{spec.persona.name}</span> · {spec.persona.role}
              {spec.persona.mood && <span className="text-muted-foreground"> · {spec.persona.mood}</span>}
            </dd>
            <dt className="text-muted-foreground">Goal</dt>
            <dd>{spec.persona.goal}</dd>
            <dt className="text-muted-foreground">Scene</dt>
            <dd>{spec.scene}</dd>
          </dl>
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{spec.persona.name} opens with</p>
            <p className="w-fit max-w-full rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm">{spec.opening}</p>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
          <div>
            <h3 className="text-sm font-semibold">
              Objectives at {decision.level}
              <span className="ml-2 text-xs font-normal tabular-nums text-muted-foreground">
                0 / {decision.objectives.length}
              </span>
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {spec.objectives.map((o) => {
                const active = activeIds.has(o.id);
                return (
                  <li key={o.id} className={cn("flex items-start gap-2", !active && "text-muted-foreground/70")}>
                    <Circle className={cn("mt-1 size-3 shrink-0", active ? "text-foreground" : "text-muted-foreground/50")} />
                    <div className="min-w-0">
                      <p className={cn(!active && "line-through decoration-muted-foreground/40")}>{o.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-mono">{o.id}</span> · from {o.activeFrom}
                        {!active && " · not active at this level"}
                        {o.openingHint && <> · persona hint: {o.openingHint}</>}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Complication</h3>
            {played ? (
              <div className="mt-2 flex flex-col gap-1.5 text-sm">
                <p className="flex items-start gap-2">
                  <Zap className="mt-0.5 size-3.5 shrink-0 text-brand" />
                  <span>
                    {played.text}
                    <span className="block text-[11px] text-muted-foreground">
                      <span className="font-mono">{played.id}</span> · from {played.activeFrom}
                    </span>
                  </span>
                </p>
                {complications.length > 1 && (
                  <p className="text-[11px] text-muted-foreground">
                    Also active but unused (only the first is played): {complications.slice(1).map((c) => c.id).join(", ")}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No complication at {decision.level}.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

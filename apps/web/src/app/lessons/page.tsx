"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CEFR_LEVELS,
  type CefrLevel,
  type ProgramResponse,
} from "@arna/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { LEVEL_LABELS, TRACK_LABELS } from "@/lib/labels";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  completed: { label: "Tamamlandı", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  in_progress: { label: "Devam ediyor", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  not_started: { label: "", cls: "" },
};


export default function LessonsPage() {
  const router = useRouter();
  const [program, setProgram] = useState<ProgramResponse | null>(null);
  const [newLevel, setNewLevel] = useState<CefrLevel | "">("");
  const [regenBusy, setRegenBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setProgram(await api<ProgramResponse>("/v1/programs/current"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) router.replace("/onboarding");
      else toast.error("Program yüklenemedi");
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function regenerate(body: { cefrLevel?: CefrLevel } = {}) {
    setRegenBusy(true);
    try {
      await api("/v1/programs/regenerate", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Yeni programın hazır!");
      await load();
    } catch {
      toast.error("Program yeniden oluşturulamadı");
    } finally {
      setRegenBusy(false);
    }
  }

  if (!program) {
    return (
      <main className="mx-auto max-w-2xl p-4 pt-10">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="mb-3 h-20 w-full rounded-xl" />
        ))}
      </main>
    );
  }

  const done = program.lessons.filter((l) => l.status === "completed").length;

  return (
    <main className="mx-auto max-w-2xl p-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-bold">Derslerin</h1>
          <p className="text-sm text-muted-foreground">
            {LEVEL_LABELS[program.level].split(" · ")[0]} · {TRACK_LABELS[program.track].title} ·{" "}
            {done}/{program.lessons.length} tamamlandı
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            disabled={regenBusy}
            onClick={() => void regenerate()}
            title="Mevcut profil ve seviyeyle programı baştan üretir"
          >
            {regenBusy ? "Oluşturuluyor…" : "↻ Yeniden oluştur"}
          </Button>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
              Ayarlar
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seviyeni değiştir</DialogTitle>
                <DialogDescription>
                  Yeni seviye için program baştan oluşturulur. Tamamladığın dersler ve profilin
                  kaybolmaz — sadece ders listesi yenilenir.
                </DialogDescription>
              </DialogHeader>
              <Select value={newLevel} onValueChange={(v) => setNewLevel(v as CefrLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Yeni seviye" />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button
                  onClick={() => newLevel && void regenerate({ cefrLevel: newLevel })}
                  disabled={!newLevel || regenBusy}
                >
                  {regenBusy ? "Oluşturuluyor… (1 dk sürebilir)" : "Programı yeniden oluştur"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost" size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
          >
            Çıkış
          </Button>
        </div>
      </header>

      <div className="grid gap-2">
        {program.lessons.map((l) => {
          const badge = STATUS_BADGE[l.status];
          return (
            <Link
              key={l.id}
              href={`/lesson/${l.id}`}
              className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{l.position}</span>
                    <h3 className="font-semibold group-hover:text-primary">{l.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{l.focus}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground/70">🎬 {l.theme}</p>
                </div>
                {badge?.label && (
                  <Badge variant="outline" className={badge.cls}>{badge.label}</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

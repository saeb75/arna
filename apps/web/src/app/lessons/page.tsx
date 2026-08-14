"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CEFR_LEVELS, type CefrLevel, type CurriculumResponse, type LessonKind } from "@arna/contracts";
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
import { LEVEL_LABELS, LEVEL_NAMES, TRACK_LABELS } from "@/lib/labels";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  completed: { label: "Tamamlandı", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  in_progress: { label: "Devam ediyor", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  not_started: { label: "", cls: "" },
};

/** Ders tipi rozetleri — müfredatın ritmi listede de görünsün diye. */
const KIND_BADGE: Record<LessonKind, { label: string; cls: string }> = {
  grammar: { label: "Dilbilgisi", cls: "bg-sky-500/10 text-sky-400 border-sky-500/25" },
  phrases: { label: "Kalıplar", cls: "bg-violet-500/10 text-violet-400 border-violet-500/25" },
  practice: { label: "Konuşma", cls: "bg-orange-500/10 text-orange-400 border-orange-500/25" },
};

export default function LessonsPage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null);
  const [newLevel, setNewLevel] = useState<CefrLevel | "">("");
  const [levelBusy, setLevelBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setCurriculum(await api<CurriculumResponse>("/v1/curriculum/current"));
    } catch (err) {
      // 404 burada YALNIZCA "profil yok" demek. Yeni kullanıcının hiç ilerleme
      // satırı olmaması normaldir ve dolu bir liste döner, 404 değil.
      if (err instanceof ApiError && err.status === 404) router.replace("/onboarding");
      else toast.error("Müfredat yüklenemedi");
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Seviye değişimi artık yalnızca profili günceller — ilerleme korunur. */
  async function changeLevel(cefrLevel: CefrLevel) {
    setLevelBusy(true);
    try {
      setCurriculum(
        await api<CurriculumResponse>("/v1/me/profile", {
          method: "PATCH",
          body: JSON.stringify({ cefrLevel }),
        }),
      );
      toast.success("Seviyen güncellendi");
    } catch {
      toast.error("Seviye değiştirilemedi");
    } finally {
      setLevelBusy(false);
    }
  }

  if (!curriculum) {
    return (
      <main className="mx-auto max-w-2xl p-4 pt-10">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="mb-3 h-20 w-full rounded-xl" />
        ))}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-bold">Derslerin</h1>
          <p className="text-sm text-muted-foreground">
            {LEVEL_NAMES[curriculum.level]} · {curriculum.label} ·{" "}
            {TRACK_LABELS[curriculum.track].title} · {curriculum.totals.completed}/
            {curriculum.totals.lessons} tamamlandı
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
              Ayarlar
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seviyeni değiştir</DialogTitle>
                <DialogDescription>
                  Seçtiğin seviyenin ders listesi açılır. Tamamladığın dersler ve ilerlemen
                  olduğu gibi kalır — istediğin zaman geri dönebilirsin.
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
                  onClick={() => newLevel && void changeLevel(newLevel)}
                  disabled={!newLevel || levelBusy}
                >
                  {levelBusy ? "Değiştiriliyor…" : "Seviyeyi değiştir"}
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

      {curriculum.units.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Bu seviyenin dersleri henüz hazırlanmadı. Başka bir seviye seçebilirsin.
        </p>
      ) : (
        <div className="grid gap-8">
          {curriculum.units.map((unit) => {
            const unitDone = unit.lessons.filter((l) => l.status === "completed").length;
            return (
              <section key={unit.index}>
                <div className="mb-3 border-b border-border/60 pb-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-semibold">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {unit.index}
                      </span>
                      {unit.title}
                    </h2>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {unitDone}/{unit.lessons.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground/80">{unit.goal}</p>
                </div>

                <div className="grid gap-2">
                  {unit.lessons.map((l) => {
                    const badge = STATUS_BADGE[l.status];
                    const kind = KIND_BADGE[l.kind];
                    return (
                      <Link
                        key={l.id}
                        href={`/lesson/${l.id}`}
                        className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {l.position}
                              </span>
                              <h3 className="font-semibold group-hover:text-primary">{l.title}</h3>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{l.focus}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {badge?.label && (
                              <Badge variant="outline" className={badge.cls}>{badge.label}</Badge>
                            )}
                            <Badge variant="outline" className={kind.cls}>{kind.label}</Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {/* ÜNİTE SONU TESTİ — ünitenin dersleri karışık sorulur.
                      Dersin hemen ardından değil, günler sonra: aralıklı geri
                      getirme + harmanlama. Kapı DEĞİL, ayna: hiçbir dersi kilitlemez. */}
                  <Link
                    href={`/checkpoint/${curriculum.level}/${unit.index}`}
                    className="group rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 transition hover:border-primary"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold group-hover:text-primary">
                          Ünite {unit.index} testi
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Bu ünitenin dersleri karışık — kendini sına
                        </p>
                      </div>
                      <span className="shrink-0 text-lg">🎯</span>
                    </div>
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

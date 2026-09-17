"use client";

// ÜNİTE SONU TESTİ — dersin sohbet akışından KASITLI olarak farklı bir ekran.
//
// Derste cevaplar serbest metindir ve hoşgörü şarttır (LLM emniyet ağı). Burada
// ÖLÇÜM yapılır: her maddenin tek doğru cevabı var, değerlendirme tamamen kodda
// (`gradeCheckpointItem`) — LLM çağrısı, maliyet ve haksız ret yok.

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  gradeCheckpointItem,
  type Checkpoint,
  type CheckpointAnswer,
  type CheckpointItem,
} from "@glotmate/contracts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api, ApiError } from "@/lib/api";

/** Maddenin ekrandaki yönergesi — chrome'dan, ana dilde. */
function labelOf(item: CheckpointItem, labels: Checkpoint["labels"]): string {
  return item.kind === "mcq" ? labels.mcq : item.kind === "gap" ? labels.gap : labels.order;
}

export default function CheckpointPage({
  params,
}: {
  params: Promise<{ level: string; unit: string }>;
}) {
  const { level, unit } = use(params);
  const router = useRouter();

  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  /** Seçilen şık (mcq/gap) ya da dizilen kelimeler (order) */
  const [choice, setChoice] = useState<number | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  /** Cevap gönderildi mi — gönderilmeden sonraki maddeye geçilmez */
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [weak, setWeak] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  /** Testi derle. Her çağrıda farklı örneklem gelir — tekrar denemede yeni sorular. */
  const load = useCallback(async () => {
    try {
      setCheckpoint(await api<Checkpoint>(`/v1/checkpoints/${level}/${unit}`));
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "unknown";
      setLoadError(
        code === "not_enough_items"
          ? "Bu ünitenin dersleri henüz hazır değil."
          : code === "unit_not_found"
            ? "Ünite bulunamadı."
            : "Test yüklenemedi.",
      );
    }
  }, [level, unit]);

  useEffect(() => {
    void load();
  }, [load]);

  const item = checkpoint?.items[index];

  const answer = useMemo<CheckpointAnswer | null>(() => {
    if (!item) return null;
    if (item.kind === "order") {
      return built.length === item.tokens.length
        ? { kind: "order", tokens: built.map((i) => item.tokens[i]!) }
        : null;
    }
    return choice === null ? null : { kind: "choice", index: choice };
  }, [item, choice, built]);

  const isCorrect = item && answer ? gradeCheckpointItem(item, answer) : false;

  const submit = useCallback(() => {
    if (!item || !answer || checked) return;
    setChecked(true);
    if (gradeCheckpointItem(item, answer)) setCorrectCount((c) => c + 1);
    else setWeak((w) => (w.includes(item.lessonId) ? w : [...w, item.lessonId]));
  }, [item, answer, checked]);

  const next = useCallback(async () => {
    if (!checkpoint) return;
    if (index + 1 < checkpoint.items.length) {
      setIndex((i) => i + 1);
      setChoice(null);
      setBuilt([]);
      setChecked(false);
      return;
    }
    setDone(true);
    try {
      await api(`/v1/checkpoints/${level}/${unit}`, {
        method: "POST",
        body: JSON.stringify({ score: correctCount, total: checkpoint.items.length, weakLessonIds: weak }),
      });
    } catch {
      toast.error("Sonuç kaydedilemedi, ama testi tamamladın.");
    }
  }, [checkpoint, index, level, unit, correctCount, weak]);

  if (loadError) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-destructive">{loadError}</p>
        <Button variant="outline" onClick={() => router.push("/lessons")}>← Derslere dön</Button>
      </main>
    );
  }

  if (!checkpoint) {
    return <main className="flex h-dvh items-center justify-center p-6 text-muted-foreground">Test hazırlanıyor…</main>;
  }

  if (done) {
    const total = checkpoint.items.length;
    const pct = Math.round((correctCount / total) * 100);
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 p-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Ünite {checkpoint.unitIndex} testi
          </p>
          <p className="mt-3 text-5xl font-semibold tabular-nums">
            {correctCount}<span className="text-2xl text-muted-foreground">/{total}</span>
          </p>
          <p className="mt-2 text-muted-foreground">
            {pct >= 80 ? "Çok iyi! Bu ünite oturmuş." : pct >= 50 ? "Fena değil — birkaç konuyu tekrar edelim." : "Bu üniteyi tekrar etmekte fayda var."}
          </p>
        </div>

        {weak.length > 0 && (
          <div className="rounded-xl border p-4">
            <p className="mb-2 text-sm font-medium">Tekrar etmeni önerdiğim dersler</p>
            <div className="grid gap-2">
              {weak.map((id) => (
                <Link key={id} href={`/lesson/${id}`} className="text-sm text-primary hover:underline">
                  → {id.replace(/^[a-c][12]-/, "").replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Sunucu her derlemede farklı örneklem verir — gerçekten yeni sorular
              setCheckpoint(null);
              setIndex(0);
              setChoice(null);
              setBuilt([]);
              setChecked(false);
              setCorrectCount(0);
              setWeak([]);
              setDone(false);
              void load();
            }}
          >
            Yeni sorularla tekrar dene
          </Button>
          <Button onClick={() => router.push("/lessons")}>Derslere dön</Button>
        </div>
      </main>
    );
  }

  if (!item) return null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-4 pb-8">
      <header className="flex items-center gap-3 pt-2">
        <button onClick={() => router.push("/lessons")} aria-label="Çık" className="text-muted-foreground">✕</button>
        <Progress value={((index + (checked ? 1 : 0)) / checkpoint.items.length) * 100} className="h-2 flex-1" />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {index + 1}/{checkpoint.items.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-5">
        <p className="text-sm font-medium text-muted-foreground">{labelOf(item, checkpoint.labels)}</p>

        {item.kind === "order" ? (
          <>
            {/* Kurulan cümle — kutucuğa dokununca geri alınır */}
            <div className="min-h-16 rounded-xl border border-dashed p-3" dir="auto">
              <div className="flex flex-wrap gap-2">
                {built.map((tokenIdx, pos) => (
                  <button
                    key={`${tokenIdx}-${pos}`}
                    disabled={checked}
                    onClick={() => setBuilt((b) => b.filter((_, i) => i !== pos))}
                    className="rounded-lg border bg-card px-3 py-1.5 text-[15px] disabled:opacity-60"
                  >
                    {item.tokens[tokenIdx]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.tokens.map((token, i) =>
                built.includes(i) ? (
                  <span key={i} className="rounded-lg border border-transparent bg-muted/40 px-3 py-1.5 text-[15px] opacity-40">
                    {token}
                  </span>
                ) : (
                  <button
                    key={i}
                    disabled={checked}
                    onClick={() => setBuilt((b) => [...b, i])}
                    className="rounded-lg border bg-card px-3 py-1.5 text-[15px] hover:border-primary disabled:opacity-60"
                  >
                    {token}
                  </button>
                ),
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-xl leading-relaxed" dir="auto">{item.prompt}</p>
            <div className="grid gap-2">
              {item.options.map((option, i) => {
                const picked = choice === i;
                const showRight = checked && i === item.correctIndex;
                const showWrong = checked && picked && i !== item.correctIndex;
                return (
                  <button
                    key={i}
                    disabled={checked}
                    onClick={() => setChoice(i)}
                    dir="auto"
                    className={`rounded-xl border-2 px-4 py-3 text-left text-[15px] transition ${
                      showRight
                        ? "border-emerald-500 bg-emerald-500/10"
                        : showWrong
                          ? "border-destructive bg-destructive/10"
                          : picked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {checked && (
          <div
            className={`rounded-xl p-4 text-sm ${
              isCorrect ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-destructive/10"
            }`}
          >
            <p className="font-medium">{isCorrect ? "Doğru!" : "Doğrusu:"}</p>
            {!isCorrect && (
              <p className="mt-1" dir="auto">
                {item.kind === "order" ? item.answer.join(" ") : item.options[item.correctIndex]}
              </p>
            )}
            {/* Dil paketinden gelen şık açıklaması (varsa) — ana dilde */}
            {item.kind === "mcq" && item.optionFeedback?.[choice ?? -1] && (
              <p className="mt-1 text-muted-foreground">{item.optionFeedback[choice ?? 0]}</p>
            )}
          </div>
        )}
      </div>

      <Button size="lg" disabled={!answer} onClick={checked ? () => void next() : submit}>
        {checked ? (index + 1 < checkpoint.items.length ? "Devam" : "Bitir") : "Kontrol et"}
      </Button>
    </main>
  );
}

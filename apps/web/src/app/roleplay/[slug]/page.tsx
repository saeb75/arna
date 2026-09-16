"use client";

import dynamic from "next/dynamic";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useVoiceSession } from "@/hooks/useVoiceSession";

const AvatarScene = dynamic(() => import("@/components/AvatarScene"), { ssr: false });

/**
 * ROLEPLAY OYUN SAYFASI — brief → oyun → debrief.
 *
 * Ders sayfasından FARKI: faz makinesi yok, beat yok, sayaç yok. Sunucu oturumun
 * roleplay olduğunu kendisi biliyor (session_kind); istemci yalnız konuşur ve
 * canlı hedef listesini `sendChat` dönüşündeki progress/newHits ile günceller.
 * SOHBETİ BİTİREN YALNIZ "Bitir" BUTONU — sunucu segmentDone'u hep false döner
 * ve istemci ona zaten bakmaz.
 */

type Run = { lang: "en" | "l1"; text: string };

interface Brief {
  slug: string;
  title: string;
  category: string;
  persona: { name: string; role: string; goal: string; mood?: string };
  scene: string;
  playedLevel: string;
  raised: boolean;
  objectives: Array<{ id: string; label: string }>;
}

interface StartResponse extends Brief {
  sessionId: string;
  opening: string;
}

interface Debrief {
  objectives: Array<{ id: string; label: string; done: boolean; evidence: string | null }>;
  progress: { done: number; total: number };
  playedLevel: string;
  coaching: Run[][];
}

interface Bubble {
  role: "user" | "assistant";
  text: string;
}

function RunsText({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) =>
        r.lang === "en" ? (
          <bdi key={i} className="font-medium text-primary">{r.text}</bdi>
        ) : (
          <span key={i}>{r.text}</span>
        ),
      )}
    </>
  );
}

export default function RoleplayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [stage, setStage] = useState<"brief" | "play" | "debrief">("brief");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hitIds, setHitIds] = useState<Set<string>>(new Set());
  const [awaiting, setAwaiting] = useState(false);
  const [sending, setSending] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [typed, setTyped] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const voice = useVoiceSession(sessionId);
  const { status, timeline, getTime, getLevel } = voice;

  useEffect(() => {
    void (async () => {
      try {
        setBrief(await api<Brief>(`/v1/roleplays/${slug}`));
      } catch {
        toast.error("Roleplay bulunamadı");
        router.replace("/roleplay");
      }
    })();
  }, [slug, router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles]);

  const start = useCallback(async () => {
    try {
      const res = await api<StartResponse>(`/v1/roleplays/${slug}/sessions`, { method: "POST" });
      setSessionId(res.sessionId);
      await voice.unlock();
      setBubbles([{ role: "assistant", text: res.opening }]);
      setStage("play");
      // Açılış spec'ten gelir — LLM yok, deterministik. Ses bitince söz öğrencide.
      window.setTimeout(() => {
        void voice.speak(res.opening, () => setAwaiting(true));
      }, 200);
    } catch {
      toast.error("Oturum açılamadı");
    }
  }, [slug, voice]);

  const handleUserText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      setAwaiting(false);
      setSending(true);
      setBubbles((b) => [...b, { role: "user", text: trimmed }]);
      try {
        const res = await voice.sendChat(trimmed);
        if (!res) return;
        if (res.newHits?.length) {
          setHitIds((prev) => {
            const next = new Set(prev);
            for (const h of res.newHits!) next.add(h.objectiveId);
            return next;
          });
        }
        setBubbles((b) => [...b, { role: "assistant", text: res.text }]);
        void voice.speak(res.runs ?? res.text, () => setAwaiting(true));
      } catch {
        toast.error("Gönderilemedi");
        setAwaiting(true);
      } finally {
        setSending(false);
      }
    },
    [voice, sending],
  );

  const handleRelease = useCallback(async () => {
    const text = await voice.release();
    if (text) void handleUserText(text);
    else setAwaiting(true);
  }, [voice, handleUserText]);

  const finish = useCallback(async () => {
    if (!sessionId) return;
    setEnding(true);
    try {
      const res = await api<{ ok: true; debrief?: Debrief | null }>(
        `/v1/sessions/${sessionId}/end`,
        { method: "POST" },
      );
      setDebrief(res.debrief ?? null);
      setStage("debrief");
    } catch {
      toast.error("Oturum kapatılamadı");
    } finally {
      setEnding(false);
      setFinishOpen(false);
    }
  }, [sessionId]);

  // --- BRIEF -----------------------------------------------------------------
  if (stage === "brief") {
    if (!brief) return <main className="p-6 text-sm text-muted-foreground">Yükleniyor…</main>;
    return (
      <main className="mx-auto max-w-xl space-y-6 p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">{brief.title}</h1>
          <p className="text-sm text-muted-foreground">
            {brief.persona.name} — {brief.persona.role}
          </p>
        </header>

        {brief.raised && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600">
            Bu senaryo <strong>{brief.playedLevel}</strong> zorluğunda oynanır.
          </p>
        )}

        <Card>
          <CardContent className="space-y-3 p-4 text-sm">
            <p>{brief.scene}</p>
            <div>
              <p className="mb-2 font-medium">Bu konuşmada yapman gerekenler:</p>
              <ul className="space-y-1">
                {brief.objectives.map((o) => (
                  <li key={o.id} className="flex items-center gap-2">
                    <span className="inline-block size-4 rounded-full border border-muted-foreground/40" />
                    {o.label}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={() => void start()} className="flex-1">Başla</Button>
          <Button variant="outline" onClick={() => router.push("/roleplay")}>Geri</Button>
        </div>
      </main>
    );
  }

  // --- DEBRIEF -----------------------------------------------------------------
  if (stage === "debrief") {
    return (
      <main className="mx-auto max-w-xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Nasıl geçti?</h1>

        {/* VERİ: hedef özeti — ikili başarı etiketi YOK, yalnız sayı */}
        {debrief && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {debrief.progress.done}/{debrief.progress.total} hedef tamamlandı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {debrief.objectives.map((o) => (
                <div key={o.id} className="flex items-start gap-2">
                  <span className={o.done ? "text-emerald-500" : "text-muted-foreground"}>
                    {o.done ? "✓" : "○"}
                  </span>
                  <div>
                    <p>{o.label}</p>
                    {o.evidence && (
                      <p className="text-xs text-muted-foreground">“{o.evidence}”</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ÖĞRETİM: en fazla üç koçluk maddesi — hedef özetinden AYRI blok */}
        {debrief && debrief.coaching.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Emma'dan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {debrief.coaching.map((runs, i) => (
                <p key={i}><RunsText runs={runs} /></p>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} className="flex-1">Tekrar oyna</Button>
          <Button variant="outline" onClick={() => router.push("/roleplay")}>Listeye dön</Button>
        </div>
      </main>
    );
  }

  // --- OYUN --------------------------------------------------------------------
  const inputLocked = !awaiting || sending;
  // Hepsi tamamlandı mı — sunucunun döndürdüğü tiklerden türer, istemci hesap yapmaz
  const allDone = !!brief && brief.objectives.length > 0 && hitIds.size === brief.objectives.length;

  return (
    <main className="flex h-dvh flex-col">
      <div className="relative flex shrink-0 justify-center bg-gradient-to-b from-indigo-950 to-neutral-900 py-3">
        {/* 4:3 YATAY — ders sayfasıyla aynı: göğüs kadrajının yatay alanı
            kutunun oranından gelir (bkz. AvatarScene FRAMING_DISTANCE) */}
        <div className="aspect-[4/3] h-[30dvh] max-w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <AvatarScene
            avatarUrl="/fatman.glb"
            animationUrl="/idle.fbx"
            animate={false}
            timeline={timeline}
            getTime={getTime}
            getLevel={getLevel}
            greet={status === "speaking"}
          />
        </div>
        <button
          onClick={() => setFinishOpen(true)}
          aria-label="Bitir"
          className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
        >
          ✕
        </button>
      </div>

      {/* Canlı hedef listesi — ürünün kancası. Tik geri alınmaz. */}
      {brief && (
        <div className="flex flex-wrap gap-1.5 border-b bg-background/95 px-4 py-2">
          {brief.objectives.map((o) => {
            const done = hitIds.has(o.id);
            return (
              <Badge
                key={o.id}
                variant={done ? "default" : "outline"}
                className={done ? "bg-emerald-600 hover:bg-emerald-600" : "text-muted-foreground"}
              >
                {done ? "✓ " : ""}{o.label}
              </Badge>
            );
          })}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              b.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {b.text}
          </div>
        ))}
      </div>

      {allDone && (
        <div className="flex items-center justify-between gap-3 border-t bg-emerald-500/10 px-4 py-3">
          <p className="text-sm font-medium text-emerald-600">
            🎉 Roleplay bitti — bütün hedefler tamamlandı!
          </p>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Tekrar başla
            </Button>
            <Button size="sm" onClick={() => void finish()} disabled={ending}>
              {ending ? "Kapatılıyor…" : "Bitir"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t p-3">
        <Input
          value={typed}
          disabled={inputLocked}
          placeholder={awaiting ? "Yaz ya da mikrofona bas…" : "…"}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && typed.trim()) {
              void handleUserText(typed);
              setTyped("");
            }
          }}
        />
        <button
          type="button"
          disabled={inputLocked}
          onPointerDown={(e) => {
            if (inputLocked) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            voice.press();
          }}
          onPointerUp={() => void handleRelease()}
          onPointerCancel={() => void handleRelease()}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: "none" }}
          className={`flex size-14 shrink-0 select-none items-center justify-center rounded-full text-xl text-white shadow-lg transition disabled:opacity-40 ${
            status === "listening" ? "animate-pulse bg-red-600" : "bg-primary"
          }`}
          aria-label="Bas-konuş"
        >
          🎙
        </button>
      </div>

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konuşmayı bitir?</DialogTitle>
            <DialogDescription>
              {hitIds.size}/{brief?.objectives.length ?? 0} hedef tamamlandı. İstersen devam edebilirsin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishOpen(false)}>Devam et</Button>
            <Button onClick={() => void finish()} disabled={ending}>
              {ending ? "Kapatılıyor…" : "Bitir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

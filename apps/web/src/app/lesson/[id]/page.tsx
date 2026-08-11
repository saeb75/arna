"use client";

// Sohbet tabanlı ders deneyimi: LECTURE (anlatım + alıştırma) → PRACTICE (roleplay).
// Akışı hoca yönetir: konuşur, cevap bekler, devam eder. Kullanıcı "ilerlet" butonuna basmaz.

import dynamic from "next/dynamic";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  decideAfterTutorReply,
  decideInWrapup,
  decideOnStudentInput,
  isLastQuestionExchange,
  type LectureBeat,
  type LessonContent,
  type SessionScript,
} from "@arna/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useVoiceSession } from "@/hooks/useVoiceSession";

const AvatarScene = dynamic(() => import("@/components/AvatarScene"), { ssr: false });

type Phase = "lecture" | "practice" | "wrapup" | "done";
type Awaiting = null | "ask" | "exercise" | "open_response" | "practice" | "wrapup";

interface Message {
  id: string;
  role: "teacher" | "user";
  text: string;
  /** Madde madde anlatım balonu */
  points?: string[];
  translation?: string;
}

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

const OPTION_LETTERS = ["a", "b", "c", "d"];

/**
 * Kısa onaylar LLM'e sorulmaz. AMA kutup önemlidir: "Hazır mısın?" ile
 * "Sorun var mı?" sorularında AYNI kelime TERS anlama gelir.
 *   "Hazır mısın?"  → evet = başla
 *   "Sorun var mı?" → evet = SORUM VAR (beklenmeli), hayır = devam
 * Bu yüzden tek küme değil, üç kutup: onaylayan / reddeden / yön belirtmeyen.
 */
const ACK_YES = new Set([
  "yes", "yeah", "yep", "yup", "i do", "i have", "a question", "one question",
  "evet", "var", "sorum var", "bir sorum var", "tabii", "aynen",
]);
const ACK_NO = new Set([
  "no", "nope", "nah", "no thanks", "no thank you", "nothing", "none", "not really",
  "im good", "i'm good", "all good", "all clear",
  "hayir", "hayır", "yok", "yoktur", "sorum yok", "gerek yok", "anladim", "anladım",
]);
/** Yön belirtmez, her iki soruda da "devam edelim" demektir. */
const ACK_PROCEED = new Set([
  "ok", "okay", "sure", "ready", "im ready", "i am ready", "lets go", "let's go",
  "lets start", "let's start", "all right", "alright", "go ahead", "continue",
  "tamam", "tamamdir", "tamamdır", "hazirim", "hazırım", "olur", "peki",
  "baslayalim", "başlayalım", "devam", "devam edelim",
]);

type AckKind = "yes" | "no" | "proceed";

/** Kısa bir onay/ret mi? Değilse null (gerçek bir mesaj → LLM'e gider). */
function ackKind(text: string): AckKind | null {
  const t = text.toLowerCase().replace(/[^a-zçğıöşü' ]/gi, " ").replace(/\s+/g, " ").trim();
  if (!t || t.split(" ").length > 4) return null;
  if (ACK_NO.has(t)) return "no";
  if (ACK_YES.has(t)) return "yes";
  if (ACK_PROCEED.has(t)) return "proceed";
  return null;
}

/** Sesli/yazılı cevabı kabul edilen cevaplarla gevşek eşleştirir. */
function matchesAnswer(input: string, beat: Extract<LectureBeat, { kind: "exercise" }>): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  const said = norm(input);
  if (!said) return false;

  // Çoktan seçmelide "A" / "1" / şık metni kabul edilir
  if (beat.options?.length) {
    const idx = beat.options.findIndex((o) => beat.answers.some((a) => norm(a) === norm(o)));
    if (idx >= 0) {
      const letter = OPTION_LETTERS[idx];
      if (said === letter || said === String(idx + 1) || said === `${letter})`) return true;
    }
  }
  return beat.answers.some((a) => {
    const want = norm(a);
    if (!want) return false;
    // Öğrenci cevabı bir cümle içinde söylediyse kabul: "I finished it" ⊃ "finished"
    if (said.includes(want)) return true;
    // Kısaltarak söylediyse de kabul ("finish" ⊂ "finished") — AMA çok kısa girdi
    // yanlışlıkla eşleşmemeli: "a" tek başına "always"i doğru saydırıyordu.
    return said.length >= 4 && want.includes(said);
  });
}

/** Ekranda gösterilecek alıştırma metni (şıklar dahil). */
function exerciseText(beat: Extract<LectureBeat, { kind: "exercise" }>): string {
  if (!beat.options?.length) return beat.prompt;
  // Model bazen şıkları prompt'un İÇİNE de yazıyor; alta bir daha eklersek ekranda
  // iki kez görünüyor. Lint bunu artık reddediyor ama eski içerik de doğru görünsün.
  if (beat.options.some((o) => beat.prompt.includes(o))) return beat.prompt;
  const lines = beat.options.map((o, i) => `${OPTION_LETTERS[i]!.toUpperCase()}) ${o}`);
  return `${beat.prompt}\n${lines.join("\n")}`;
}

/** Seslendirme için markdown yıldızlarını temizler. */
const plain = (s: string) => s.replace(/\*\*/g, "");

/**
 * Sunucu script'i düşerse akış durmasın diye istemci-tarafı son çare.
 * (Sunucuda da deterministik bir yedek var; bu, yanıtta script hiç gelmediği hâl.)
 */
const FALLBACK_PRACTICE_INTRO = "Nice work! Now let's practise what you learned with a short role play.";
const FALLBACK_PRAISE = ["Exactly right!", "Well done!", "That's it!", "Perfect!"];
const FALLBACK_INVITE_QUESTION = "Of course! What would you like to know?";
const FALLBACK_WRAPUP = "That's it for today's lesson — great work! Is there anything you would like to ask me?";
const FALLBACK_FAREWELL = "Wonderful. Well done today. See you in the next lesson!";

/**
 * Hocanın bu beat'te söyleyeceği cümle. Ders içeriğinde birebir metin YOKTUR —
 * beat yalnızca niyeti taşır, cümle oturum script'inden gelir.
 */
function spokenLine(beat: LectureBeat, script: SessionScript | null): string {
  const line = script?.beats[beat.id];
  if (line) return line;
  if (beat.kind === "ask") {
    return beat.purpose === "readiness"
      ? "Hi! Are you ready to start?"
      : "Is there anything you want to ask before we try some exercises?";
  }
  if (beat.kind === "teach") return "Here is how it works.";
  return "Great! Let's try a few questions.";
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: programLessonId } = use(params);
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  /**
   * Hocanın BU oturumda söyleyeceği cümleler. Ders içeriği kullanıcıdan bağımsız;
   * selamlama/geçiş/övgü cümleleri oturum açılışında sunucuda üretilir (ad + hafıza).
   */
  const [script, setScript] = useState<SessionScript | null>(null);
  const [started, setStarted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>("lecture");
  const [beatIndex, setBeatIndex] = useState(0);
  const [awaiting, setAwaiting] = useState<Awaiting>(null);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [hintShown, setHintShown] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);

  const voice = useVoiceSession(sessionId);
  const { status, error, timeline, getTime, getLevel } = voice;

  const attemptRef = useRef(0);
  const practiceTurnRef = useRef(0);
  /** Akış kararları state yerine ref'ten okunur — StrictMode'da güvenli */
  const beatIndexRef = useRef(0);
  const practiceStartedRef = useRef(false);
  const wrapupStartedRef = useRef(false);
  const fetchedRef = useRef(false);
  /** Bu beat'te kaç GERÇEK LLM turu geçti — sonsuz soru-cevap sarmalını keser */
  const beatExchangesRef = useRef(0);
  /** Kaç kez soru daveti yapıldı (LLM'siz) — LLM bütçesinden ayrı sayılır */
  const invitesRef = useRef(0);
  /** Övgü havuzunda sıradaki cümle — aynı ders içinde tekrar etmesin */
  const praiseIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const enteredRef = useRef<string | null>(null);

  // --- ders içeriğini getir -------------------------------------------------
  useEffect(() => {
    if (fetchedRef.current) return; // StrictMode çift çağrısını engelle
    fetchedRef.current = true;
    (async () => {
      try {
        const data = await api<{ lessonId: string; lesson: LessonContent }>(
          `/v1/lessons/${programLessonId}`,
        );
        setLesson(data.lesson);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Ders yüklenemedi");
      }
    })();
  }, [programLessonId]);

  // --- sohbet yardımcıları --------------------------------------------------
  const pushTeacher = useCallback((text: string, points?: string[]) => {
    const msg: Message = { id: nextId(), role: "teacher", text, points };
    setMessages((m) => [...m, msg]);
    return msg.id;
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const finishLesson = useCallback(async () => {
    setPhase("done");
    setAwaiting(null);
    if (sessionId) await api(`/v1/sessions/${sessionId}/end`, { method: "POST" }).catch(() => undefined);
  }, [sessionId]);

  /**
   * KAPANIŞ — practice bitince hoca rol karakterinden çıkar ve dersi kendi kapatır.
   * Buradan sonra ders KENDİLİĞİNDEN bitmez: tek çıkış "Dersi Bitir" butonudur.
   */
  const startWrapup = useCallback(() => {
    if (!lesson || wrapupStartedRef.current) return; // idempotent (StrictMode koruması)
    wrapupStartedRef.current = true;
    setPhase("wrapup");
    const line = script?.wrapup ?? FALLBACK_WRAPUP;
    pushTeacher(line);
    void voice.speak(line, () => setAwaiting("wrapup"));
  }, [lesson, script, pushTeacher, voice]);

  const startPractice = useCallback(() => {
    if (!lesson || practiceStartedRef.current) return; // idempotent (StrictMode koruması)
    practiceStartedRef.current = true;
    setPhase("practice");
    practiceTurnRef.current = 0;
    const p = lesson.practice;
    const intro = script?.practiceIntro ?? FALLBACK_PRACTICE_INTRO;
    pushTeacher(intro);
    void voice.speak(intro, () => {
      pushTeacher(p.avatarOpening);
      void voice.speak(p.avatarOpening, () => setAwaiting("practice"));
    });
  }, [lesson, script, pushTeacher, voice]);

  /**
   * Bir sonraki lecture beat'ine geç; bittiyse practice fazına.
   * Yan etki state güncelleyicisinin İÇİNDE olmamalı — StrictMode updater'ı iki kez
   * çalıştırdığından faz iki kez başlıyordu (çift balon + çift TTS).
   */
  const advance = useCallback(
    (fromBeatId?: string) => {
      if (!lesson) return;
      // Aynı beat'ten gelen ikinci bir ilerleme isteği YOK SAYILIR — yoksa iki
      // çağrı indeksi 2 artırıp bir beat'i sessizce atlıyor.
      const current = lesson.lecture.beats[beatIndexRef.current];
      if (fromBeatId && current?.id !== fromBeatId) return;

      const next = beatIndexRef.current + 1;
      if (next >= lesson.lecture.beats.length) {
        window.setTimeout(startPractice, 500);
        return;
      }
      beatIndexRef.current = next;
      setBeatIndex(next);
    },
    [lesson, startPractice],
  );

  // --- beat'e giriş: hoca konuşur, gerekiyorsa cevap bekler -----------------
  useEffect(() => {
    if (!lesson || !sessionId || !started || phase !== "lecture") return;
    const beat = lesson.lecture.beats[beatIndex];
    if (!beat || enteredRef.current === beat.id) return;
    enteredRef.current = beat.id;
    attemptRef.current = 0;
    beatExchangesRef.current = 0;
    invitesRef.current = 0;
    setHintShown(null);

    switch (beat.kind) {
      case "say": {
        const line = spokenLine(beat, script);
        pushTeacher(line);
        void voice.speak(line, () => window.setTimeout(() => advance(beat.id), 300));
        break;
      }
      case "ask": {
        const line = spokenLine(beat, script);
        pushTeacher(line);
        void voice.speak(line, () => setAwaiting("ask"));
        break;
      }
      case "teach": {
        const line = spokenLine(beat, script);
        pushTeacher(line);
        void voice.speak(line, () => {
          pushTeacher("", beat.points);
          void voice.speak(plain(beat.points.join(" ")), () =>
            window.setTimeout(() => advance(beat.id), 400),
          );
        });
        break;
      }
      case "exercise": {
        // Şıklar da SESLENDİRİLİR: sadece prompt okunduğunda öğrenci seçenekleri
        // duymuyordu — sesli-öncelikli bir üründe soruyu cevaplayamaz hâle geliyordu.
        const asked = exerciseText(beat);
        pushTeacher(asked);
        void voice.speak(plain(asked), () => setAwaiting("exercise"));
        break;
      }
      case "open_response":
        pushTeacher(beat.prompt);
        void voice.speak(plain(beat.prompt), () => setAwaiting("open_response"));
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, sessionId, started, phase, beatIndex]);

  // --- kullanıcı girdisi ----------------------------------------------------
  const handleUserText = useCallback(
    async (text: string) => {
      if (!lesson || !awaiting) return;
      pushUser(text);
      setHintShown(null);
      const beat = lesson.lecture.beats[beatIndex];

      if (awaiting === "practice") {
        setAwaiting(null);
        const turnIndex = practiceTurnRef.current++;
        const res = await voice.sendChat(text, { phase: "practice", turnIndex });
        if (!res) {
          practiceTurnRef.current -= 1; // aktarım hatası tur yemesin
          return setAwaiting("practice");
        }
        pushTeacher(res.text);
        void voice.speak(res.text, () => {
          // Sahne bitti → ders BİTMEZ, hoca kapanışa geçer.
          if (res.segmentDone) window.setTimeout(startWrapup, 500);
          else setAwaiting("practice");
        });
        return;
      }

      // KAPANIŞ — hiçbir dal dersi bitirmez; tek çıkış "Dersi Bitir" butonu.
      if (awaiting === "wrapup") {
        const decision = decideInWrapup(ackKind(text));

        if (decision.kind === "farewell") {
          setAwaiting(null);
          const bye = script?.farewell ?? FALLBACK_FAREWELL;
          pushTeacher(bye);
          void voice.speak(bye, () => setAwaiting("wrapup"));
          return;
        }

        if (decision.kind === "invite") {
          setAwaiting(null);
          const invite = script?.inviteQuestion ?? FALLBACK_INVITE_QUESTION;
          pushTeacher(invite);
          void voice.speak(invite, () => setAwaiting("wrapup"));
          return;
        }

        setAwaiting(null);
        const res = await voice.sendChat(text, { phase: "wrapup" });
        if (!res) return setAwaiting("wrapup");
        pushTeacher(res.text);
        void voice.speak(res.text, () => setAwaiting("wrapup"));
        return;
      }

      if (!beat) return;

      // AKIŞ KARARI BURADA VERİLMEZ — saf makineden gelir (@arna/contracts).
      // Kararın girdileri: öğrencinin sözü, sayaçlar, beat alanları. Hocanın
      // cevabının METNİ asla girdi değildir (üç canlı hatanın sebebi buydu).
      const before = decideOnStudentInput(beat, {
        ack: ackKind(text),
        exchanges: beatExchangesRef.current,
        invites: invitesRef.current,
        attempt: attemptRef.current,
        answerMatched: beat.kind === "exercise" ? matchesAnswer(text, beat) : false,
      });

      if (before.kind === "advance") {
        setAwaiting(null);
        window.setTimeout(() => advance(beat.id), 250);
        return;
      }

      if (before.kind === "invite") {
        // "Sorun var mı?" → "evet": öğrenci sorusunu sorsun diye BEKLERİZ.
        // Davet LLM'e GİTMEZ, o yüzden soru bütçesinden de yemez — ayrı sayaç.
        invitesRef.current += 1;
        const invite = script?.inviteQuestion ?? FALLBACK_INVITE_QUESTION;
        pushTeacher(invite);
        void voice.speak(invite, () => setAwaiting("ask"));
        return;
      }

      if (before.kind === "praise") {
        setAwaiting(null);
        const pool = script?.praise?.length ? script.praise : FALLBACK_PRAISE;
        const praise = pool[praiseIndexRef.current++ % pool.length]!;
        pushTeacher(praise);
        void voice.speak(praise, () => window.setTimeout(() => advance(beat.id), 300));
        return;
      }

      // before.kind === "askTutor"
      const waitingKind = awaiting;
      setAwaiting(null);
      const attempt = attemptRef.current;

      // Bu, soru penceresinin son turuysa hoca "başka sorun var mı?" DEMEZ, kapanış
      // yapar — yoksa Emma soru sorarken akış ilerliyor, ders kendiyle çelişiyor.
      // (Sayaç ARTMADAN önce, yani bu turun kaçıncı olduğuna göre hesaplanır.)
      const lastExchange = isLastQuestionExchange(beat, beatExchangesRef.current);

      beatExchangesRef.current += 1;
      attemptRef.current += 1;

      const res = await voice.sendChat(text, {
        phase: "lecture",
        beatId: beat.id,
        attempt,
        lastExchange,
      });
      if (!res) {
        // Aktarım hatası deneme hakkı YEMEZ — sayaçlar geri alınır.
        beatExchangesRef.current -= 1;
        attemptRef.current -= 1;
        return setAwaiting(waitingKind);
      }

      // Selamlama/konu dışı laf CEVAP DENEMESİ değildir → hak geri verilir.
      // ("Hey!" ve konu dışı bir cümle iki denemeyi de yakıp soruyu atlatmıştı.)
      if (res.isAttempt === false) attemptRef.current -= 1;

      pushTeacher(res.text);
      const after = decideAfterTutorReply(beat, {
        exchanges: beatExchangesRef.current,
        attempt,
        beatDone: res.beatDone,
        isAttempt: res.isAttempt,
      });
      void voice.speak(res.text, () => {
        if (after.kind === "wait") setAwaiting(after.awaiting);
        else window.setTimeout(() => advance(beat.id), 300);
      });
    },
    [lesson, script, awaiting, beatIndex, pushUser, pushTeacher, voice, advance, startWrapup],
  );

  const handleRelease = useCallback(async () => {
    const text = await voice.release();
    if (text) void handleUserText(text);
  }, [voice, handleUserText]);

  const start = useCallback(async () => {
    try {
      await voice.unlock();
      // Sunucu bu çağrıda hocanın cümlelerini üretir (ad + hafıza + geçen ders) —
      // bu yüzden yanıt birkaç saniye sürebilir; buton zaten bekleme durumunda.
      const data = await api<{ sessionId: string; script: SessionScript | null }>(
        `/v1/lessons/${programLessonId}/sessions`,
        { method: "POST" },
      );
      setSessionId(data.sessionId);
      setScript(data.script);
      setStarted(true);
    } catch {
      toast.error("Oturum başlatılamadı");
    }
  }, [programLessonId, voice]);

  const showHint = useCallback(() => {
    if (!lesson) return;
    const beat = lesson.lecture.beats[beatIndex];
    if (awaiting === "exercise" && beat?.kind === "exercise") setHintShown(beat.hint);
    else if (awaiting === "open_response" && beat?.kind === "open_response") setHintShown(beat.hint);
    else if (awaiting === "practice") setHintShown(`Şunları kullanmayı dene: ${lesson.practice.mustUse.join(", ")}`);
    else toast.info("Şu an ipucu yok — dinlemeye devam et");
  }, [lesson, beatIndex, awaiting]);

  // --- ekranlar -------------------------------------------------------------
  if (loadError) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{loadError}</p>
        <Button variant="outline" onClick={() => router.push("/lessons")}>← Derslere dön</Button>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="flex h-dvh items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader><CardTitle>Ders hazırlanıyor…</CardTitle></CardHeader>
          <CardContent>
            <Progress value={null} className="animate-pulse" />
            <p className="mt-3 text-sm text-muted-foreground">
              Bu ders ilk kez açılıyorsa içerik şimdi üretiliyor (~20 sn)
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="flex h-dvh items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader><CardTitle>{lesson.title}</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              📖 {lesson.focus} · 🎬 {lesson.theme} · ~{lesson.estMinutes} dk
            </p>
            <Button size="lg" onClick={() => void start()}>▶ Derse başla</Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/lessons")}>
              ← Derslere dön
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
        <Card className="text-center">
          <CardHeader><CardTitle className="text-2xl">🎉 Ders tamamlandı!</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-muted-foreground">📝 {lesson.summary}</p>
            <p className="text-muted-foreground">{lesson.title}</p>
          </CardContent>
        </Card>
        {lesson.quiz && lesson.quiz.length > 0 && <QuizSection quiz={lesson.quiz} />}
        <Button size="lg" onClick={() => router.push("/lessons")}>Derslere dön</Button>
      </main>
    );
  }

  const micBusy = status === "speaking" || status === "thinking" || status === "transcribing";

  return (
    <main className="flex h-dvh flex-col bg-background">
      {/* Avatar + faz göstergesi */}
      <div className="relative h-[36dvh] shrink-0 bg-gradient-to-b from-indigo-950 to-neutral-900">
        <AvatarScene
          avatarUrl="/fatman.glb"
          animationUrl="/idle.fbx"
          animate={false}
          timeline={timeline}
          getTime={getTime}
          getLevel={getLevel}
        />
        <button
          onClick={() => setFinishOpen(true)}
          aria-label="Dersi kapat"
          className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
        >
          ✕
        </button>
        <PhaseRail phase={phase} />
      </div>

      {/* Sohbet */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {messages.map((m) =>
            m.role === "teacher" ? (
              <TeacherBubble
                key={m.id}
                message={m}
                /* Emma konuşurken tekrar dinlemek AKIŞI ÖLDÜRÜYORDU: tek bir <audio>
                   paylaşılıyor, ikinci speak() `onended`'i ezip devam callback'ini
                   yok ediyordu. Konuşma bitene kadar buton kapalı. */
                replayDisabled={status === "speaking" || status === "thinking"}
                onReplay={() => void voice.speak(plain(m.points ? m.points.join(" ") : m.text))}
                onTranslate={async () => {
                  const tr = await voice.translate(m.points ? m.points.join(" ") : m.text);
                  if (tr) setMessages((all) => all.map((x) => (x.id === m.id ? { ...x, translation: tr } : x)));
                }}
              />
            ) : (
              <div key={m.id} className="max-w-[80%] self-end rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground">
                {m.text}
              </div>
            ),
          )}
          {status === "thinking" && (
            <div className="w-16 rounded-2xl bg-muted px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            </div>
          )}
          {hintShown && (
            <div className="max-w-[85%] self-end rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm">
              <p className="font-semibold text-amber-600 dark:text-amber-400">Söyleyebileceğin bir örnek:</p>
              <p className="text-foreground/90">{hintShown}</p>
            </div>
          )}
          {error && <p className="self-center text-xs text-destructive">{error}</p>}
        </div>
      </div>

      {/* Alt çubuk: Type · Mic · Inspire */}
      <div className="shrink-0 border-t bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto max-w-2xl">
          {/* Kapanışta dersi bitiren TEK şey bu buton — hiçbir sayaç kapatmaz.
              Sohbet açık kalır; öğrenci istediği kadar soru sorabilir. */}
          {phase === "wrapup" && (
            <Button
              size="lg"
              className="mb-3 w-full"
              onClick={() => void finishLesson()}
            >
              Dersi Bitir
            </Button>
          )}
          {typing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const t = draft.trim();
                if (!t || !awaiting) return;
                setDraft("");
                void handleUserText(t);
              }}
              className="mb-3 flex gap-2"
            >
              <Input
                autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                placeholder={awaiting ? "Cevabını yaz…" : "Emma konuşuyor…"}
                disabled={!awaiting}
              />
              <Button type="submit" disabled={!awaiting || !draft.trim()}>Gönder</Button>
            </form>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setTyping((t) => !t)}
              className={`flex w-20 flex-col items-center gap-1 text-xs ${typing ? "text-primary" : "text-muted-foreground"}`}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-muted text-lg">⌨️</span>
              Yaz
            </button>

            <button
              type="button"
              disabled={!awaiting || micBusy}
              onPointerDown={(e) => {
                if (!awaiting || micBusy) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                voice.press();
              }}
              onPointerUp={() => void handleRelease()}
              onPointerCancel={() => void handleRelease()}
              onContextMenu={(e) => e.preventDefault()}
              style={{ touchAction: "none" }}
              className={`flex size-18 select-none items-center justify-center rounded-full text-2xl text-white shadow-lg transition disabled:opacity-40 ${
                status === "listening" ? "animate-pulse bg-red-600" : "bg-primary"
              }`}
              aria-label="Bas-konuş"
            >
              🎤
            </button>

            <button
              onClick={showHint}
              className="flex w-20 flex-col items-center gap-1 text-xs text-muted-foreground"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-muted text-lg">💡</span>
              İpucu
            </button>
          </div>

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {status === "listening"
              ? "Dinliyor… bırakınca gönderilir"
              : status === "speaking"
                ? "Emma konuşuyor…"
                : status === "transcribing"
                  ? "Yazıya döküyor…"
                  : awaiting
                    ? "Cevabın için mikrofonu basılı tut"
                    : "Dersi dinle…"}
          </p>
        </div>
      </div>

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dersten çık</DialogTitle>
            <DialogDescription>
              Dersi şimdi bitirmek istediğine emin misin? İlerlemen kaydedilir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinishOpen(false)}>Devam et</Button>
            <Button onClick={() => void finishLesson()}>Bitir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

// ---------------------------------------------------------------------------

function PhaseRail({ phase }: { phase: Phase }) {
  const items: { key: Phase; label: string }[] = [
    { key: "lecture", label: "Lecture" },
    { key: "practice", label: "Practice" },
    { key: "wrapup", label: "Kapanış" },
  ];
  const order: Phase[] = ["lecture", "practice", "wrapup"];
  return (
    <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-white">
      {items.map((it, i) => {
        const active = phase === it.key;
        const done = order.indexOf(phase) > order.indexOf(it.key);
        return (
          <div key={it.key} className="flex items-center gap-2">
            <span className="flex w-3 justify-center">
              <span
                className={`size-2.5 rounded-full ${
                  active ? "bg-white" : done ? "bg-white/70" : "bg-white/30"
                }`}
              />
            </span>
            <span className={`text-sm ${active ? "font-semibold" : "text-white/50"}`}>{it.label}</span>
            {i === 0 && <span className="sr-only">,</span>}
          </div>
        );
      })}
    </div>
  );
}

function TeacherBubble({
  message, onReplay, onTranslate, replayDisabled,
}: {
  message: Message;
  onReplay: () => void;
  onTranslate: () => Promise<void>;
  replayDisabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex max-w-[85%] items-start gap-2">
      <div className="rounded-2xl bg-muted px-4 py-2.5">
        {message.points ? (
          <ul className="grid gap-1.5 text-[15px] leading-relaxed">
            {message.points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span dangerouslySetInnerHTML={{ __html: boldify(p) }} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line text-[15px] leading-relaxed">{message.text}</p>
        )}
        {message.translation && (
          <p className="mt-2 border-t pt-2 text-sm text-muted-foreground">{message.translation}</p>
        )}
      </div>
      <div className="mt-1 flex shrink-0 gap-1">
        <button
          onClick={async () => {
            if (message.translation || busy) return;
            setBusy(true);
            await onTranslate();
            setBusy(false);
          }}
          aria-label="Çevir"
          className="flex size-7 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          disabled={busy}
        >
          文
        </button>
        <button
          onClick={onReplay}
          aria-label="Tekrar dinle"
          className="flex size-7 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          disabled={replayDisabled}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

/** **kalın** işaretlerini <strong>'a çevirir (içerik LLM'den, HTML kaçışlı). */
function boldify(s: string): string {
  const escaped = s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// --- Ders sonrası isteğe bağlı mini test ------------------------------------

function QuizSection({ quiz }: { quiz: NonNullable<LessonContent["quiz"]> }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const done = index >= quiz.length;

  if (!started) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-4">
          <div>
            <p className="font-semibold">Mini Test</p>
            <p className="text-xs text-muted-foreground">{quiz.length} soru · isteğe bağlı</p>
          </div>
          <Button variant="secondary" onClick={() => setStarted(true)}>Teste başla</Button>
        </CardContent>
      </Card>
    );
  }
  if (done) {
    return (
      <Card>
        <CardContent className="pt-4 text-center">
          <p className="font-semibold text-emerald-500">✓ Test bitti — tebrikler!</p>
        </CardContent>
      </Card>
    );
  }

  const q = quiz[index]!;
  return (
    <div className="grid gap-2">
      <p className="px-1 text-xs text-muted-foreground">Soru {index + 1}/{quiz.length}</p>
      {q.type === "mcq" ? (
        <QuizMcq key={q.id} q={q} onNext={() => setIndex((i) => i + 1)} />
      ) : (
        <QuizFill key={q.id} q={q} onNext={() => setIndex((i) => i + 1)} />
      )}
      <button
        onClick={() => setIndex((i) => i + 1)}
        className="text-center text-xs text-muted-foreground hover:text-foreground"
      >
        Bu soruyu atla →
      </button>
    </div>
  );
}

function QuizMcq({
  q, onNext,
}: {
  q: { id: string; type: "mcq"; stem: string; options: string[]; correctIndex: number; feedbackPerOption?: string[] };
  onNext: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === q.correctIndex;
  return (
    <Card>
      <CardContent className="grid gap-3 pt-4">
        <p className="text-sm font-medium">{q.stem}</p>
        <div className="grid gap-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              disabled={picked !== null && correct}
              onClick={() => setPicked(i)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                picked === null
                  ? "border-border hover:bg-muted"
                  : i === q.correctIndex && picked === i
                    ? "border-emerald-500 bg-emerald-500/20"
                    : picked === i
                      ? "border-red-500 bg-red-500/20"
                      : "border-border opacity-60"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {picked !== null && (
          <p className={`text-xs ${correct ? "text-emerald-500" : "text-red-500"}`}>
            {correct ? "✓ Doğru!" : "✗ Tekrar dene"}
            {q.feedbackPerOption?.[picked] ? ` — ${q.feedbackPerOption[picked]}` : ""}
          </p>
        )}
        {correct && <Button onClick={onNext} className="w-full">Devam →</Button>}
      </CardContent>
    </Card>
  );
}

function QuizFill({
  q, onNext,
}: { q: { id: string; type: "fill_blank"; text: string; answers: string[][] }; onNext: () => void }) {
  const parts = q.text.split("___");
  const [values, setValues] = useState<string[]>(() => new Array(q.answers.length).fill(""));
  const [checked, setChecked] = useState(false);
  const results = q.answers.map((accepted, i) =>
    accepted.some((a) => a.trim().toLowerCase() === (values[i] ?? "").trim().toLowerCase()),
  );
  const allOk = results.every(Boolean);

  return (
    <Card>
      <CardContent className="grid gap-3 pt-4">
        <div className="flex flex-wrap items-center gap-1 text-sm leading-8">
          {parts.map((part, i) => (
            <span key={i} className="contents">
              <span>{part}</span>
              {i < q.answers.length && (
                <Input
                  value={values[i] ?? ""}
                  onChange={(e) => {
                    const next = [...values];
                    next[i] = e.target.value;
                    setValues(next);
                    setChecked(false);
                  }}
                  className={`inline-flex h-8 w-32 ${
                    checked ? (results[i] ? "border-emerald-500" : "border-red-500") : ""
                  }`}
                />
              )}
            </span>
          ))}
        </div>
        {checked && !allOk && (
          <p className="text-xs text-red-500">
            İpucu: {q.answers.map((a) => a[0]).join(", ")}
          </p>
        )}
        {checked && allOk ? (
          <Button onClick={onNext} className="w-full">✓ Doğru — devam →</Button>
        ) : (
          <Button variant="secondary" onClick={() => setChecked(true)} className="w-full">
            Kontrol et
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

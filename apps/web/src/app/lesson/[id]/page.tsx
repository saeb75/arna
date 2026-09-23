"use client";

// Sohbet tabanlı ders deneyimi: LECTURE (anlatım + alıştırma) → PRACTICE (roleplay).
// Akışı hoca yönetir: konuşur, cevap bekler, devam eder. Kullanıcı "ilerlet" butonuna basmaz.
//
// v7: metinler DİL ETİKETLİ PARÇALAR (RichText) — native modda Emma ana dilde
// açıklar, İngilizce malzeme `en` parçası olarak ayrı stillenir ve ayrı seslendirilir.
// ACK/pes kümeleri artık hardcode DEĞİL, birleşik içerikle sunucudan gelir (lesson.ui).

import dynamic from "next/dynamic";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  classifyAck,
  decideAfterTutorReply,
  decideInWrapup,
  decideOnStudentInput,
  isLastExchange,
  matchesAnswerSpec,
  normalizeUtterance,
  triageAnswer,
  type AckKind,
  type AnswerReview,
  type AnswerReviewKind,
  type LessonContentV7,
  type RichText,
  type SessionScript,
  type ViewBeat,
} from "@glotmate/contracts";
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
  /** Düz metin (kullanıcı balonları + çeviri kaynağı) */
  text: string;
  /** v7: hocanın balonu dil etiketli parçalarla çizilir */
  runs?: RichText;
  /** Madde madde anlatım balonu — her madde kendi parça dizisi */
  points?: RichText[];
  translation?: string;
  /** `?` sheet'inin sonucu — balon başına BİR kez çekilir, sonra cache'lenir */
  review?: AnswerReview;
}

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

const OPTION_LETTERS = ["a", "b", "c", "d"];

/**
 * Yeni bir hoca balonu düştükten sonra girdinin kapalı kaldığı süre.
 * Söz kesme serbest, ama METİN GELMEDEN kesilmesin: kullanıcı okumaya fırsat
 * bulmadan tuşa basıp mesajı atlamasın diye kısa bir nefes payı.
 */
const INPUT_GRACE_MS = 500;

/** RichText → düz metin (çeviri, transkript, yedekler için). */
const runsText = (runs: RichText | undefined | null): string =>
  (runs ?? []).map((r) => r.text).join(" ");

/** Düz İngilizce metni tek parçalık RichText'e sarar. */
const enRuns = (text: string): RichText => [{ lang: "en", text }];

/**
 * Balondaki İNGİLİZCE parçalar — çeviri butonunun kaynağı.
 *
 * CANLI HATA: eskiden balonun TAMAMI çeviriye gidiyordu. Native modda balon zaten
 * ana dilde olduğu için model aynı cümleyi geri veriyordu ("Aferin, çok doğru!" →
 * "Aferin, çok doğru!"). Öğrencinin merak ettiği şey İngilizce parçanın anlamı.
 */
const englishOf = (m: Message): string =>
  (m.points ? m.points.flat() : (m.runs ?? []))
    .filter((r) => r.lang === "en")
    .map((r) => r.text)
    .join(" ")
    .trim();

/**
 * Kısa onaylar LLM'e sorulmaz. AMA kutup önemlidir: "Hazır mısın?" ile
 * "Sorun var mı?" sorularında AYNI kelime TERS anlama gelir.
 *
 * v7: kümeler HARDCODE DEĞİL — sunucudan (lesson.ui.ack = ACK_EN + chrome) gelir.
 * Eşleştirme contracts'taki `classifyAck`te: tam eşleşme + kelime-sınırlı içerme
 * ("Yok, bu kadar yeterli" → no). Canlıda tam-dize eşleşmesi bunu kaçırıp
 * LLM'e gönderiyordu; hoca soru penceresinde boş turlar dönüyordu.
 */
const ackKind = (text: string, ui: LessonContentV7["ui"]): AckKind | null => classifyAck(text, ui.ack);

/**
 * v7 cevap eşleştirme — alıştırma tipine ÖZEL, deterministik.
 * `includes` tabanlı eski eşleşme "did" cevabını "I didn't" içinde sayıyordu;
 * eşleştirme artık contracts'taki tip bazlı `matchesAnswerSpec`te (token dizisi
 * eşitliği + açık kısaltma tablosu). Çoktan seçmelide harf/numara/şık metni kabul.
 */
function matchesAnswer(input: string, beat: Extract<ViewBeat, { kind: "exercise" }>): boolean {
  const said = normalizeUtterance(input);
  if (!said) return false;

  if (beat.answerSpec.kind === "choice") {
    const idx = beat.answerSpec.correctIndex;
    const letter = OPTION_LETTERS[idx];
    if (said === letter || said === String(idx + 1) || said === `${letter})`) return true;
    const correct = beat.options?.[idx];
    return !!correct && normalizeUtterance(correct) === said;
  }
  return matchesAnswerSpec(input, beat.answerSpec);
}

/** Alıştırmanın ekranda gösterilen VE seslendirilen parçaları (şıklar dahil). */
function exerciseRuns(beat: Extract<ViewBeat, { kind: "exercise" }>): RichText {
  if (!beat.options?.length) return beat.runs;
  // Şıklar da SESLENDİRİLİR: sadece soru okunduğunda öğrenci seçenekleri
  // duymuyordu — sesli-öncelikli bir üründe soruyu cevaplayamaz hâle geliyordu.
  const optionRuns: RichText = beat.options.map((o, i) => ({
    lang: "en" as const,
    text: `${OPTION_LETTERS[i]!.toUpperCase()}) ${o}`,
  }));
  return [...beat.runs, ...optionRuns];
}

/**
 * Hocanın bu beat'te söyleyeceği parçalar. Ders içeriğinde birebir metin YOKTUR —
 * script v2 her beat'i chrome şablonuyla önceden doldurur, selamlamayı LLM yazar.
 * Buradaki yedek yalnızca script'in HİÇ gelmediği hâl içindir.
 */
function spokenLine(beat: ViewBeat, script: SessionScript | null): RichText {
  const line = script?.beats[beat.id];
  if (line?.length) return line;
  if (beat.kind === "ask") {
    return enRuns(
      beat.purpose === "readiness"
        ? "Hi! Are you ready to start?"
        : "Is there anything you want to ask before we try some exercises?",
    );
  }
  if (beat.kind === "teach") return enRuns("Here is how it works.");
  return enRuns("Great! Let's try a few questions.");
}

/** Sunucu script'i tamamen düşerse akış durmasın diye istemci-tarafı son çare. */
const FALLBACK_PRACTICE_INTRO = enRuns("Nice work! Now let's practise with a short role play.");
const FALLBACK_PRAISE = [enRuns("Exactly right!"), enRuns("Well done!"), enRuns("That's it!"), enRuns("Perfect!")];
const FALLBACK_INVITE_QUESTION = enRuns("Of course! What would you like to know?");
const FALLBACK_WRAPUP = enRuns("That's it for today's lesson — great work! Is there anything you would like to ask me?");
const FALLBACK_FAREWELL = enRuns("Wonderful. Well done today. See you in the next lesson!");

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: catalogLessonId } = use(params);
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonContentV7 | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  /**
   * Hocanın BU oturumda söyleyeceği parçalar. Ders içeriği kullanıcıdan bağımsız;
   * selamlama oturum açılışında sunucuda üretilir (ad + hafıza), gerisi şablondan.
   */
  const [script, setScript] = useState<SessionScript | null>(null);
  const [started, setStarted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>("lecture");
  const [beatIndex, setBeatIndex] = useState(0);
  const [awaiting, setAwaiting] = useState<Awaiting>(null);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [hintShown, setHintShown] = useState<RichText | null>(null);
  /** Yeni metin düştükten sonraki kısa kilit (bkz. INPUT_GRACE_MS) */
  const [inputGrace, setInputGrace] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  /** Sheet'i açık olan kullanıcı balonu (null = kapalı) */
  const [reviewFor, setReviewFor] = useState<string | null>(null);

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
  /** Sohbetin dibindeki işaret — kaydırma buna yapılır (yükseklik okumadan) */
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const graceTimerRef = useRef(0);
  // Grace zamanlayıcısı SADECE sayfa kapanırken temizlenir. Mesaj/durum değişiminde
  // koşan bir efektin temizleyicisine konulamaz: her yeni balonda kendi zamanlayıcısını
  // iptal eder ve kilit bir daha hiç açılmazdı.
  useEffect(() => () => window.clearTimeout(graceTimerRef.current), []);
  /**
   * Emma konuşurken gelen girdi. Akış `onEnd` zincirinde ilerlediği için girdiyi
   * o an işleyemeyiz: önce ileri sarıp cevap beklenen noktaya varmak, sonra
   * girdiyi ORAYA teslim etmek gerekir. Kuyruk bunun için.
   */
  const pendingInputRef = useRef<string | null>(null);
  const enteredRef = useRef<string | null>(null);

  // --- ders içeriğini getir -------------------------------------------------
  useEffect(() => {
    if (fetchedRef.current) return; // StrictMode çift çağrısını engelle
    fetchedRef.current = true;
    (async () => {
      try {
        const data = await api<{ lessonId: string; lesson: LessonContentV7 }>(
          `/v1/lessons/${catalogLessonId}`,
        );
        setLesson(data.lesson);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Ders yüklenemedi");
      }
    })();
  }, [catalogLessonId]);

  // --- sohbet yardımcıları --------------------------------------------------
  const pushTeacher = useCallback((runs: RichText, points?: RichText[]) => {
    const msg: Message = { id: nextId(), role: "teacher", text: runsText(runs), runs, points };
    setMessages((m) => [...m, msg]);
    // Yeni metin ekrana düştüğü an kısa bir kilit: kullanıcı okumaya fırsat
    // bulmadan yanlışlıkla sözü kesmesin. Kilit YALNIZCA bu aralıkta; sonrasında
    // söz kesme serbest.
    setInputGrace(true);
    window.clearTimeout(graceTimerRef.current);
    graceTimerRef.current = window.setTimeout(() => setInputGrace(false), INPUT_GRACE_MS);
    return msg.id;
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
  }, []);

  /**
   * Yeni mesaj gelince dibe in.
   *
   * CANLI HATA: eski hâli `messages` değişir değişmez `scrollHeight` okuyordu.
   * Yeni balon henüz YERLEŞMEDİĞİ için okunan değer eski yükseklikti ve kaydırma
   * eski dibe gidiyordu. Elle yazılan A1 derslerinde anlatım balonu ekrandan uzun
   * olduğu için bir sonraki mesaj ("sormak istediğin bir şey var mı?") görüş
   * alanının ALTINDA kalıyor, kullanıcı "mesaj hiç gelmedi" sanıyordu.
   *
   * Çözüm: yerleşimden SONRA (rAF) ve yükseklik hesabı yapmadan, dipteki işarete
   * kaydır. Eleman hedeflemek yazı tipi/satır kırılması gecikmelerine de bağışık.
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      bottomRef.current?.scrollIntoView({ block: "end", behavior: reduced ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, status]);

  /**
   * `?` ikonu → sheet. Sonuç balonda cache'lenir: ikinci tıklamada ağa çıkılmaz.
   * Çağrı DOKUNUŞTA yapılır, önden değil — her mesaj için peşin hesaplamak
   * maliyeti katlar ve o sheet'lerin çoğu hiç açılmaz.
   *
   * AKIŞA DOKUNMAZ: burada hiçbir faz, sayaç veya `awaiting` değişmez.
   */
  const openReview = useCallback(
    async (messageId: string) => {
      setReviewFor(messageId);
      const idx = messages.findIndex((m) => m.id === messageId);
      const msg = messages[idx];
      if (!msg || msg.review) return; // cache

      // Bağlam = hemen üstteki hoca mesajı. Cevap PARÇASI ("twenty five")
      // tek başına incelenirse haksız yere hata damgası yer.
      const prior = messages.slice(0, idx).reverse().find((m) => m.role === "teacher");
      const result = await voice.review(msg.text, prior?.text);
      if (result) {
        setMessages((all) => all.map((x) => (x.id === messageId ? { ...x, review: result } : x)));
      }
    },
    [messages, voice],
  );

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
    const line = script?.wrapup?.length ? script.wrapup : FALLBACK_WRAPUP;
    pushTeacher(line);
    void voice.speak(line, () => setAwaiting("wrapup"));
  }, [lesson, script, pushTeacher, voice]);

  const startPractice = useCallback(() => {
    if (!lesson || practiceStartedRef.current) return; // idempotent (StrictMode koruması)
    practiceStartedRef.current = true;
    setPhase("practice");
    practiceTurnRef.current = 0;
    const p = lesson.practice;
    const intro = script?.practiceIntro?.length ? script.practiceIntro : FALLBACK_PRACTICE_INTRO;
    pushTeacher(intro);
    void voice.speak(intro, () => {
      // Rol yapma TAMAMEN İngilizce — sahnenin ilk repliği içerikten, İngilizce
      pushTeacher(enRuns(p.avatarOpening));
      void voice.speak(enRuns(p.avatarOpening), () => setAwaiting("practice"));
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
        const pointRuns = beat.points.map((p) => p.runs);
        pushTeacher(line);
        void voice.speak(line, () => {
          pushTeacher([], pointRuns);
          // Maddeler sırayla tek konuşmada: parçalar zaten dil etiketli,
          // TTS her parçayı doğru telaffuzla okur (native modda TR + EN karışık).
          void voice.speak(pointRuns.flat(), () =>
            window.setTimeout(() => advance(beat.id), 400),
          );
        });
        break;
      }
      case "exercise": {
        const asked = exerciseRuns(beat);
        pushTeacher(asked);
        void voice.speak(asked, () => setAwaiting("exercise"));
        break;
      }
      case "open_response":
        pushTeacher(beat.runs);
        void voice.speak(beat.runs, () => setAwaiting("open_response"));
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
      const ack = (t: string) => ackKind(t, lesson.ui);

      if (awaiting === "practice") {
        setAwaiting(null);
        const turnIndex = practiceTurnRef.current++;
        const res = await voice.sendChat(text, { phase: "practice", turnIndex });
        if (!res) {
          practiceTurnRef.current -= 1; // aktarım hatası tur yemesin
          return setAwaiting("practice");
        }
        const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
        pushTeacher(replyRuns);
        void voice.speak(replyRuns, () => {
          // Sahne bitti → ders BİTMEZ, hoca kapanışa geçer.
          if (res.segmentDone) window.setTimeout(startWrapup, 500);
          else setAwaiting("practice");
        });
        return;
      }

      // KAPANIŞ — hiçbir dal dersi bitirmez; tek çıkış "Dersi Bitir" butonu.
      if (awaiting === "wrapup") {
        const decision = decideInWrapup(ack(text));

        if (decision.kind === "farewell") {
          setAwaiting(null);
          const bye = script?.farewell?.length ? script.farewell : FALLBACK_FAREWELL;
          pushTeacher(bye);
          void voice.speak(bye, () => setAwaiting("wrapup"));
          return;
        }

        if (decision.kind === "invite") {
          setAwaiting(null);
          const invite = script?.inviteQuestion?.length ? script.inviteQuestion : FALLBACK_INVITE_QUESTION;
          pushTeacher(invite);
          void voice.speak(invite, () => setAwaiting("wrapup"));
          return;
        }

        setAwaiting(null);
        const res = await voice.sendChat(text, { phase: "wrapup" });
        if (!res) return setAwaiting("wrapup");
        const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
        pushTeacher(replyRuns);
        void voice.speak(replyRuns, () => setAwaiting("wrapup"));
        return;
      }

      if (!beat) return;

      // AKIŞ KARARI BURADA VERİLMEZ — saf makineden gelir (@glotmate/contracts).
      // Kararın girdileri: öğrencinin sözü, sayaçlar, beat alanları. Hocanın
      // cevabının METNİ asla girdi değildir (üç canlı hatanın sebebi buydu).
      const before = decideOnStudentInput(beat, {
        ack: ack(text),
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
        const invite = script?.inviteQuestion?.length ? script.inviteQuestion : FALLBACK_INVITE_QUESTION;
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
      const lastExchange = isLastExchange(beat, beatExchangesRef.current);

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

      const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
      pushTeacher(replyRuns);
      const after = decideAfterTutorReply(beat, {
        exchanges: beatExchangesRef.current,
        attempt,
        beatDone: res.beatDone,
        isAttempt: res.isAttempt,
      });
      void voice.speak(replyRuns, () => {
        if (after.kind === "wait") setAwaiting(after.awaiting);
        else window.setTimeout(() => advance(beat.id), 300);
      });
    },
    [lesson, script, awaiting, beatIndex, pushUser, pushTeacher, voice, advance, startWrapup],
  );

  /**
   * SÖZ KESME. Emma konuşurken kullanıcı yazar ya da mikrofona basarsa: ses susar,
   * akış cevabın beklendiği ilk noktaya kadar SESSİZ ilerler (balonlar görünmeye
   * devam eder), sonra girdi oraya teslim edilir.
   */
  const bargeIn = useCallback(
    (text?: string) => {
      if (text) pendingInputRef.current = text;
      voice.setFastForward(true);
      voice.skipSpeaking();
    },
    [voice],
  );

  /** İleri sarma cevap beklenen noktada durur; kuyruktaki girdi orada işlenir. */
  useEffect(() => {
    if (!awaiting) return;
    voice.setFastForward(false);
    const queued = pendingInputRef.current;
    if (!queued) return;
    pendingInputRef.current = null;
    void handleUserText(queued);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaiting]);

  const handleRelease = useCallback(async () => {
    const text = await voice.release();
    if (!text) return;
    // Kayıt sırasında akış ileri sarıldıysa cevap beklenen noktaya gelmiş olabilir;
    // gelmediyse kuyruğa alınır ve oraya varınca işlenir.
    if (awaiting) void handleUserText(text);
    else pendingInputRef.current = text;
  }, [voice, handleUserText, awaiting]);

  const start = useCallback(async () => {
    try {
      await voice.unlock();
      // Sunucu bu çağrıda selamlamayı üretir (ad + hafıza) — birkaç saniye sürebilir.
      const data = await api<{ sessionId: string; script: SessionScript | null }>(
        `/v1/lessons/${catalogLessonId}/sessions`,
        { method: "POST" },
      );
      setSessionId(data.sessionId);
      setScript(data.script);
      setStarted(true);
    } catch {
      toast.error("Oturum başlatılamadı");
    }
  }, [catalogLessonId, voice]);

  const showHint = useCallback(() => {
    if (!lesson) return;
    const beat = lesson.lecture.beats[beatIndex];
    if (awaiting === "exercise" && beat?.kind === "exercise") setHintShown(beat.hint);
    else if (awaiting === "open_response" && beat?.kind === "open_response") setHintShown(beat.hint);
    else if (awaiting === "practice") {
      setHintShown([
        // Chrome etiketi tutor diline göre: english modda bu etiket İngilizce'dir
        { lang: lesson.tutorLanguage === "native" ? ("l1" as const) : ("en" as const), text: lesson.ui.labels.practiceHint },
        ...lesson.practice.mustUse.map((m) => ({ lang: "en" as const, text: m, emphasis: true })),
      ]);
    } else toast.info("Şu an ipucu yok — dinlemeye devam et");
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
              Dilinde ilk kez açılıyorsa çeviri katmanı şimdi hazırlanıyor (~10 sn)
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
            <p className="text-sm text-muted-foreground" dir="auto">
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
            <p className="text-sm text-muted-foreground" dir="auto">📝 {lesson.summary}</p>
            <p className="text-muted-foreground" dir="auto">{lesson.title}</p>
          </CardContent>
        </Card>
        {/* Mini test buradan KALDIRILDI: maddeler artık ünite sonu testinde
            kullanılıyor. Dersin hemen ardından sorulan soru kısa süreli belleği
            ölçer; aynı maddeyi günler sonra ve başka derslerin maddeleriyle
            KARIŞIK sormak hem gerçek öğrenmeyi ölçer hem pekiştirir. */}
        <Button size="lg" onClick={() => router.push("/lessons")}>Derslere dön</Button>
      </main>
    );
  }

  /**
   * Girdi kilidi — TEK kaynak.
   *
   * Konuşma sırasında girdi AÇIK: basmak/yazmak sözü keser (bkz. bargeIn).
   * Kapalı kaldığı iki durum var ve ikisi de "ortada okunacak metin yok" demek:
   *  - cevap sunucudan gelmemiş (thinking / transcribing),
   *  - metin yeni düştü, kullanıcıya okuması için yarım saniye tanınıyor.
   */
  const inputLocked = status === "thinking" || status === "transcribing" || inputGrace;

  /**
   * Aktif MCQ şıkları — cevap beklenirken tıklanabilir buton olarak gösterilir.
   * SEBEP: tek harf ("C") STT için en kötü girdi sınıfı — Whisper "chat"/"see"
   * duyuyordu. Buton yalnızca HASSAS BİR GİRDİ AYGITI: tıklamak şık metnini
   * `handleUserText`e vermek demek; `matchesAnswer` metin eşitliğiyle yakalar,
   * yanlış şık mevcut judge yolundan hak işleyerek akar. Akış kuralı değişmez.
   * Mikrofon/klavye açık kalır — "the first one" diyeni judge zaten kabul ediyor.
   */
  const activeBeatView = lesson?.lecture.beats[beatIndex];
  const mcqOptions =
    awaiting === "exercise" &&
    activeBeatView?.kind === "exercise" &&
    activeBeatView.answerSpec.kind === "choice" &&
    activeBeatView.options?.length
      ? activeBeatView.options
      : null;

  return (
    <main className="flex h-dvh flex-col bg-background">
      {/* Avatar + faz göstergesi. Avatar ORTADA, 4:3 YATAY kutuda: karakter
          göğüsten yukarı kadrajlanıyor (dikey kutuda bu kadrajda selam eli ve
          omuzlar kenardan taşıyor — bkz. AvatarScene FRAMING_DISTANCE). Faz
          göstergesi ve kapatma düğmesi kutunun DIŞINDA, şeridin köşelerinde. */}
      <div className="relative flex shrink-0 justify-center bg-gradient-to-b from-indigo-950 to-neutral-900 py-3">
        <div className="aspect-[4/3] h-[34dvh] max-w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <AvatarScene
            avatarUrl="/fatman.glb"
            animationUrl="/idle.fbx"
            animate={false}
            timeline={timeline}
            getTime={getTime}
            getLevel={getLevel}
            /* Hoca ilk cümlesine başladığında bir kez el kaldırıp selam verir
               (AvatarScene tek seferliği kendi içinde tutuyor). */
            greet={status === "speaking"}
          />
        </div>
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
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
                onReplay={() =>
                  void voice.speak(m.points ? m.points.flat() : (m.runs ?? enRuns(m.text)))
                }
                /* Yalnız İngilizce parçalar çevrilir; İngilizce yoksa buton yok */
                canTranslate={englishOf(m).length > 0}
                onTranslate={async () => {
                  const tr = await voice.translate(englishOf(m));
                  if (tr) setMessages((all) => all.map((x) => (x.id === m.id ? { ...x, translation: tr } : x)));
                }}
              />
            ) : (
              <UserBubble
                key={m.id}
                message={m}
                onReview={() => void openReview(m.id)}
              />
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
              <p className="font-semibold text-amber-600 dark:text-amber-400">{lesson.ui.labels.hint}</p>
              <p className="text-foreground/90" dir="auto"><RunsView runs={hintShown} /></p>
            </div>
          )}
          {error && <p className="self-center text-xs text-destructive">{error}</p>}
          {/* Kaydırma hedefi — yükseklik hesaplamadan hep dibe inmek için */}
          <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Alt çubuk: Type · Mic · Inspire */}
      <div className="shrink-0 border-t bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto max-w-2xl">
          {/* MCQ şıkları: cevap beklenirken tıklanabilir — sesle tek harf söyleme
              derdini kökten kaldırır. Dikey yığın (mobil), harf rozetli. */}
          {mcqOptions && (
            <div className="mb-3 flex flex-col gap-2">
              {mcqOptions.map((opt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  disabled={inputLocked}
                  onClick={() => void handleUserText(opt)}
                  className="h-auto min-h-11 w-full justify-start gap-3 whitespace-normal py-2.5 text-left"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {OPTION_LETTERS[i]?.toUpperCase()}
                  </span>
                  <span dir="auto">{opt}</span>
                </Button>
              ))}
            </div>
          )}
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
                if (!t) return;
                setDraft("");
                // Emma konuşuyorsa sözü kes; girdi kuyruğa girer ve akış cevabın
                // beklendiği noktaya varınca işlenir.
                if (awaiting) void handleUserText(t);
                else bargeIn(t);
              }}
              className="mb-3 flex gap-2"
            >
              <Input
                autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  inputLocked ? "Emma yazıyor…" : awaiting ? "Cevabını yaz…" : "Yaz ve gönder — Emma susar"
                }
                disabled={inputLocked}
              />
              <Button type="submit" disabled={inputLocked || !draft.trim()}>Gönder</Button>
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
              disabled={inputLocked}
              onPointerDown={(e) => {
                if (inputLocked) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                // Emma konuşurken mikrofona basmak sözü keser: ses susar, akış
                // cevap beklenen noktaya ilerler, kayıt bırakılınca oraya işlenir.
                if (!awaiting) bargeIn();
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
                ? inputLocked
                  ? "Emma konuşuyor…"
                  : "Emma konuşuyor — araya girebilirsin"
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

      <ReviewSheet
        message={messages.find((m) => m.id === reviewFor) ?? null}
        onClose={() => setReviewFor(null)}
      />
    </main>
  );
}

// ---------------------------------------------------------------------------

/**
 * Kullanıcı balonu + `?` incelemesi.
 *
 * `?` yalnız incelenecek bir şey varken çıkar: `triageAnswer` "too_short"
 * derse ("...", tek harf) ikon hiç gösterilmez — açılıp boş bir sheet
 * göstermek, hiç göstermemekten kötüdür.
 */
function UserBubble({ message, onReview }: { message: Message; onReview: () => void }) {
  if (triageAnswer(message.text) === "too_short") {
    return (
      <div dir="auto" className="max-w-[80%] self-end rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground">
        {message.text}
      </div>
    );
  }
  return (
    <div className="flex max-w-[85%] items-start gap-2 self-end">
      <button
        onClick={onReview}
        aria-label="Bu cümleyi incele"
        className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        ?
      </button>
      <div dir="auto" className="rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground">
        {message.text}
      </div>
    </div>
  );
}

/** Hüküm → rozet. Yeşil YALNIZ `correct` içindir: düzeltme taşıyan bir sonuca
 *  yeşil tik koymak, iki durumu görsel olarak aynılaştırır ve geri bildirimi
 *  anlamsızlaştırır. */
const REVIEW_BADGE: Record<AnswerReviewKind, { icon: string; title: string; tone: string }> = {
  correct: { icon: "✓", title: "Harika — cümlen doğru", tone: "bg-emerald-500/15 text-emerald-500" },
  unnatural: { icon: "~", title: "Şöyle demek daha doğal", tone: "bg-amber-500/15 text-amber-500" },
  error: { icon: "!", title: "Şöyle demek daha doğru", tone: "bg-orange-500/15 text-orange-500" },
  other_language: { icon: "⇄", title: "İngilizce şöyle denir", tone: "bg-sky-500/15 text-sky-500" },
  too_short: { icon: "·", title: "İncelenecek bir şey yok", tone: "bg-muted text-muted-foreground" },
};

/**
 * Alttan açılan inceleme sheet'i.
 *
 * FAZ 2 NOTU: telaffuz bölümü `review.pronunciation` dolduğunda buraya EKLENİR;
 * gövde bilerek iki bağımsız bloğa ayrıldı ki o faz bu bileşeni yeniden
 * yazdırmasın. Faz 1'de alan daima null olduğu için blok hiç çizilmez.
 */
function ReviewSheet({ message, onClose }: { message: Message | null; onClose: () => void }) {
  const review = message?.review;
  const badge = review ? REVIEW_BADGE[review.kind] : null;

  return (
    <Dialog open={message !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="top-auto bottom-0 max-w-lg translate-y-0 rounded-b-none rounded-t-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Cümle incelemesi</DialogTitle>
          <DialogDescription className="sr-only">
            Yazdığın cümlenin genel İngilizce açısından değerlendirmesi.
          </DialogDescription>
        </DialogHeader>

        <p dir="auto" className="self-end rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
          {message?.text}
        </p>

        {!review ? (
          <div className="grid gap-2 py-2">
            <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badge!.tone}`}>
                {badge!.icon}
              </span>
              <div className="grid gap-1">
                <p className="font-semibold">{badge!.title}</p>
                {review.corrected && (
                  <p dir="auto" className="text-[15px]">
                    <bdi className="font-semibold text-primary">{review.corrected}</bdi>
                  </p>
                )}
              </div>
            </div>

            {review.runs.length > 0 && (
              <div className="grid gap-1 border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground">Açıklama</p>
                <p dir="auto" className="text-[15px] leading-relaxed">
                  <RunsView runs={review.runs} />
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Dil etiketli parçaların tek çizim yolu. `en` parçalar vurgulanır ve <bdi> ile
 * yalıtılır — RTL dillerde (Arapça/Farsça) İngilizce parça araya girince noktalama
 * yanlış tarafa kaçıyordu; <bdi> bunu tarayıcı düzeyinde çözer.
 * (Eski boldify/dangerouslySetInnerHTML yolu tamamen kalktı — HTML enjeksiyon
 * yüzeyi de onunla birlikte gitti.)
 */
function RunsView({ runs }: { runs: RichText }) {
  return (
    <>
      {runs.map((r, i) => (
        <span key={i} className="contents">
          {i > 0 ? " " : ""}
          {r.lang === "en" ? (
            <bdi className={r.emphasis ? "font-semibold text-primary" : "font-medium"}>{r.text}</bdi>
          ) : (
            <span>{r.text}</span>
          )}
        </span>
      ))}
    </>
  );
}

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
  message, onReplay, onTranslate, replayDisabled, canTranslate,
}: {
  message: Message;
  onReplay: () => void;
  onTranslate: () => Promise<void>;
  replayDisabled: boolean;
  /** Balonda İngilizce parça var mı — yoksa çeviri butonu anlamsız */
  canTranslate: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex max-w-[85%] items-start gap-2">
      <div className="rounded-2xl bg-muted px-4 py-2.5" dir="auto">
        {message.points ? (
          <ul className="grid gap-1.5 text-[15px] leading-relaxed">
            {message.points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span><RunsView runs={p} /></span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line text-[15px] leading-relaxed">
            {message.runs ? <RunsView runs={message.runs} /> : message.text}
          </p>
        )}
        {message.translation && (
          <p className="mt-2 border-t pt-2 text-sm text-muted-foreground">{message.translation}</p>
        )}
      </div>
      <div className="mt-1 flex shrink-0 gap-1">
        {canTranslate && (
          <button
            onClick={async () => {
              if (message.translation || busy) return;
              setBusy(true);
              await onTranslate();
              setBusy(false);
            }}
            aria-label="İngilizce kısmı çevir"
            className="flex size-7 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            disabled={busy}
          >
            文
          </button>
        )}
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


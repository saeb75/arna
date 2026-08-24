// Sesli oturumun istemci motoru — sohbet tabanlı ders için sade API:
//   speak(text, onEnd)   → hoca konuşur, ses bitince onEnd (akışın motoru)
//   press() / release()  → bas-konuş; transkript geri döner
//   sendChat(text, ctx)  → sunucudaki hocaya gönderir, cevabı döner (sayfa balonu ekler)
// Eski repodan korunan dersler: mikrofon izni yarışı, tek <audio> kilidini açma,
// barge-in nesil sayacı, iOS Safari mp4 uzantı düzeltmesi.
"use client";

import { useCallback, useRef, useState } from "react";
import { triageAnswer, type AnswerReview } from "@arna/contracts";
import { api } from "@/lib/api";
import { alignmentToLine, type ElevenAlignment } from "@/lib/alignment";
import { buildTimeline, type Timeline } from "@/lib/viseme";

export type VoiceStatus = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

export interface ChatContext {
  phase?: "lecture" | "practice" | "wrapup";
  beatId?: string;
  turnIndex?: number;
  attempt?: number;
  /** Soru penceresinin son turu: hoca "başka sorun var mı?" demeden kapatır. */
  lastExchange?: boolean;
}

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** 50ms'lik sessiz WAV — audio elementini kullanıcı jesti içinde oynatıp kilidini açar. */
function silentWav(): string {
  const n = 400;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true);
  v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  let bin = "";
  for (const byte of new Uint8Array(buf)) bin += String.fromCharCode(byte);
  return "data:audio/wav;base64," + btoa(bin);
}

export function useVoiceSession(sessionId: string | null) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);

  const sessionRef = useRef<string | null>(sessionId);
  sessionRef.current = sessionId;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const samplesRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const pressedRef = useRef(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef(0);
  const micPromiseRef = useRef<Promise<void> | null>(null);
  const genRef = useRef(0);
  /** O an çalan konuşmanın sonlandırıcısı — söz kesildiğinde zorla çağrılır. */
  const currentFinishRef = useRef<((force?: boolean) => void) | null>(null);
  /** Açıkken konuşmalar sessiz ve anında geçilir (söz kesme sonrası ileri sarma). */
  const fastForwardRef = useRef(false);

  /** Tek audio elementi + RMS analiz zinciri (ilk kullanıcı jestinde kurulur). */
  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    const ctx = new AudioContext();
    const node = ctx.createAnalyser();
    node.fftSize = 1024;
    node.smoothingTimeConstant = 0.35;
    ctx.createMediaElementSource(audio).connect(node);
    node.connect(ctx.destination);
    if (ctx.state === "suspended") void ctx.resume();
    analyserRef.current = node;
    samplesRef.current = new Float32Array(node.fftSize);
    audioRef.current = audio;
    return audio;
  }, []);

  /** Kullanıcı jestinde çağrılmalı ("Derse başla") — autoplay kilidini açar. */
  const unlock = useCallback(async () => {
    const audio = ensureAudio();
    audio.src = silentWav();
    await audio.play().catch(() => undefined);
  }, [ensureAudio]);

  const getTime = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused && !audio.ended) return audio.currentTime;
    return null;
  }, []);

  const getLevel = useCallback(() => {
    const node = analyserRef.current;
    const buf = samplesRef.current;
    const audio = audioRef.current;
    if (!node || !buf || !audio || audio.paused || audio.ended) return null;
    node.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i]! * buf[i]!;
    return Math.sqrt(sum / buf.length);
  }, []);

  /**
   * Hoca konuşur; `onEnd` TÜM klipler bitince çağrılır — otomatik akışın motoru.
   *
   * v7: girdi dil etiketli parçalar (RichText) da olabilir; sunucu her parçayı
   * kendi diliyle seslendirir ve KLİP LİSTESİ döner. Klipler tek `speak()`
   * içinde sırayla çalınır; `settle()` yine TAM BİR KEZ ateşlenir — kaybolan
   * her callback dersi kilitler, bu disiplin klip sayısından bağımsızdır.
   */
  const speak = useCallback(
    async (input: string | Array<{ lang: "en" | "l1"; text: string }>, onEnd?: () => void) => {
      const gen = genRef.current;
      const sid = sessionRef.current;
      if (!sid) return;

      // İLERİ SARMA: kullanıcı söz kesti, akış kullanıcının konuşabileceği ilk
      // noktaya kadar SESSİZ koşar. Balonlar `speak`'ten ÖNCE ekrana basıldığı
      // için hiçbir içerik kaybolmaz; yalnız ses atlanır ve zincir hemen ilerler.
      if (fastForwardRef.current) {
        setStatus("idle");
        onEnd?.();
        return;
      }

      try {
        const runs = typeof input === "string" ? [{ lang: "en" as const, text: input }] : input;
        const data = await api<{
          clips: Array<{ audioBase64: string; alignment: ElevenAlignment | null; lang: string }>;
        }>(`/v1/sessions/${sid}/tts`, { method: "POST", body: JSON.stringify({ runs }) });
        if (gen !== genRef.current) return;

        const audio = ensureAudio();

        let settled = false;
        let watchdog = 0;
        /**
         * `force`: söz kesme kaynaklı BİLİNÇLİ sonlandırma — akış ilerlemeli.
         * Zorlanmadığında gen koruması aynen geçerli: geç gelen eski bir TTS
         * yanıtı akışı ilerletemez (o koruma söz kesmeden bağımsız durmalı).
         */
        const finish = (force = false) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(watchdog);
          if (currentFinishRef.current === finish) currentFinishRef.current = null;
          if (!force && gen !== genRef.current) return;
          setStatus("idle");
          onEnd?.();
        };
        const settle = () => finish();
        currentFinishRef.current = finish;

        // TTS kapsamı dışı dil: hiç klip gelmemiş olabilir — metin ekranda kaldı,
        // akış yine ilerlemeli.
        if (data.clips.length === 0) {
          settle();
          return;
        }

        let index = 0;
        const playClip = async () => {
          const clip = data.clips[index];
          if (!clip || gen !== genRef.current) {
            settle();
            return;
          }
          const bytes = Uint8Array.from(atob(clip.audioBase64), (c) => c.charCodeAt(0));
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
          blobUrlRef.current = url;

          setTimeline(clip.alignment ? buildTimeline([alignmentToLine(clip.alignment)], null) : null);
          audio.src = url;

          audio.onended = () => {
            index += 1;
            if (index < data.clips.length) void playClip();
            else settle();
          };
          audio.onerror = () => {
            // Bozuk klip: kalanları dene, hiçbiri gitmezse yine settle
            index += 1;
            if (index < data.clips.length) void playClip();
            else settle();
          };

          await audio.play();
          if (gen === genRef.current) setStatus("speaking");
        };

        await playClip();

        // Son çare: `ended` hiç gelmezse ders ölmesin — klip sayısına göre cömert tavan
        watchdog = window.setTimeout(settle, 90_000 + data.clips.length * 30_000);
      } catch (err) {
        if (gen === genRef.current) {
          setError(errorText(err));
          setStatus("idle");
          onEnd?.(); // ses üretilemese bile akış tıkanmasın
        }
      }
    },
    [ensureAudio],
  );

  /** Sunucudaki hocaya mesaj gönderir; cevabı döner (sayfa balonu ekler + seslendirir). */
  const sendChat = useCallback(
    async (
      text: string,
      ctx: ChatContext = {},
    ): Promise<{
      text: string;
      /** v7: dil etiketli parçalar — ekran ve TTS bunları kullanır, text yalnızca yedek */
      runs?: Array<{ lang: "en" | "l1"; text: string }>;
      segmentDone: boolean;
      beatDone: boolean;
      /** Alıştırma/açık uçlu adımda: öğrencinin sözü cevap denemesi miydi? */
      isAttempt: boolean;
      /** Roleplay oturumlarında dolu — ders sayfası bunları yok sayar */
      progress?: { done: number; total: number };
      newHits?: Array<{ objectiveId: string; evidence: string }>;
    } | null> => {
      const sid = sessionRef.current;
      if (!sid) return null;
      const gen = genRef.current;
      setStatus("thinking");
      try {
        const data = await api<{
          text: string;
          runs?: Array<{ lang: "en" | "l1"; text: string }>;
          segmentDone?: boolean;
          beatDone?: boolean;
          isAttempt?: boolean;
        }>(
          `/v1/sessions/${sid}/chat`,
          { method: "POST", body: JSON.stringify({ text, ...ctx }) },
        );
        if (gen !== genRef.current) {
          // "thinking"te bırakılırsa micBusy kalıcı true olur → mikrofon bir daha açılmaz
          setStatus("idle");
          return null;
        }
        // beatDone: açık uçlu adımda "bu adım tamam" (rubrik kabul etti ya da hak bitti)
        return {
          text: data.text,
          segmentDone: data.segmentDone === true,
          beatDone: data.beatDone === true,
          // Sunucu bu alanı yollamadıysa (ask/practice turları) deneme sayılır
          isAttempt: data.isAttempt !== false,
        };
      } catch (err) {
        if (gen === genRef.current) {
          setError(errorText(err));
          setStatus("idle");
        }
        return null;
      }
    },
    [],
  );

  /** Balon çevirisi (文A). */
  const translate = useCallback(async (text: string): Promise<string | null> => {
    const sid = sessionRef.current;
    if (!sid) return null;
    try {
      const data = await api<{ text: string }>(`/v1/sessions/${sid}/translate`, {
        method: "POST",
        body: JSON.stringify({ text: text.slice(0, 500) }),
      });
      return data.text;
    } catch {
      return null;
    }
  }, []);

  /**
   * Cevap incelemesi (balonun yanındaki `?`). Ders akışına DOKUNMAZ — sonucu
   * yalnız sheet gösterir, hiçbir faz/sayaç bundan etkilenmez.
   *
   * `triageAnswer` burada da çağrılır: "yes" gibi ifadeler için ağa hiç çıkılmaz
   * (sunucu aynı kapıyı ikinci kez tutuyor, bu yalnız gereksiz gidiş-dönüşü keser).
   */
  const review = useCallback(
    async (text: string, context?: string): Promise<AnswerReview | null> => {
      const triaged = triageAnswer(text);
      if (triaged) return { kind: triaged, corrected: "", runs: [], pronunciation: null };

      const sid = sessionRef.current;
      if (!sid) return null;
      try {
        return await api<AnswerReview>(`/v1/sessions/${sid}/review`, {
          method: "POST",
          body: JSON.stringify({ text: text.slice(0, 900), context: context?.slice(0, 900) }),
        });
      } catch {
        return null;
      }
    },
    [],
  );

  const stopAndProcess = useCallback(async (): Promise<string | null> => {
    const rec = recRef.current;
    recRef.current = null;
    if (rec && rec.state !== "inactive") {
      await new Promise<void>((resolve) => {
        rec.onstop = () => resolve();
        rec.stop();
      });
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    const gen = genRef.current;
    const duration = performance.now() - recStartRef.current;
    const blob = new Blob(chunksRef.current, { type: rec?.mimeType || "audio/webm" });
    chunksRef.current = [];
    if (duration < 400 || blob.size < 1000) {
      setError("Çok kısa kayıt — butonu basılı tutarak konuş.");
      setStatus("idle");
      return null;
    }

    setStatus("transcribing");
    const sid = sessionRef.current;
    if (!sid) return null;
    try {
      // OpenAI formatı dosya UZANTISINDAN çözer (iOS Safari mp4 üretir)
      const mime = blob.type || "audio/webm";
      const ext = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "webm";
      const form = new FormData();
      form.append("file", blob, `speech.${ext}`);
      const data = await api<{ text: string }>(`/v1/sessions/${sid}/stt`, { method: "POST", body: form });
      if (gen !== genRef.current) return null;
      const text = data.text.trim();
      if (!text) {
        setError("Ses anlaşılamadı — tekrar dener misin?");
        setStatus("idle");
        return null;
      }
      setError(null);
      return text;
    } catch (err) {
      if (gen === genRef.current) {
        setError(errorText(err));
        setStatus("idle");
      }
      return null;
    }
  }, []);

  /**
   * SÖZ KESME. Çalan sesi durdurur ve o konuşmanın `onEnd`'ini ZORLA çalıştırır.
   *
   * Eskiden yalnız `genRef` artırılıyordu; `settle()` gen uyuşmazlığında sessizce
   * dönüyor ve `onEnd` hiç çalışmıyordu — akış `onEnd` zincirinde yaşadığı için
   * ders KİLİTLENİYORDU. Bu yüzden konuşma sırasında girdi kapalıydı. Artık akış
   * ilerler; `fastForward` ile de kullanıcının konuşabileceği ilk noktaya kadar
   * kalan konuşmalar sessizce geçilir.
   */
  const skipSpeaking = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) audio.pause();
    setTimeline(null);
    currentFinishRef.current?.(true);
  }, []);

  /** İleri sarma anahtarı — `awaiting` kurulunca istemci kapatır. */
  const setFastForward = useCallback((on: boolean) => {
    fastForwardRef.current = on;
  }, []);

  /** Bas-konuş: basılınca (jest bağlamında senkron). */
  const press = useCallback(() => {
    if (pressedRef.current) return;
    pressedRef.current = true;

    // Söz kesme: çalan cevabı durdur, geciken istekleri düşür
    genRef.current += 1;
    const audio = audioRef.current;
    if (audio && !audio.paused) audio.pause();
    setTimeline(null);
    setError(null);
    setStatus("listening");

    recStartRef.current = performance.now();
    micPromiseRef.current = navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      .then((stream) => {
        if (!pressedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        chunksRef.current = [];
        const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) =>
          MediaRecorder.isTypeSupported(t),
        );
        const rec = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
        recRef.current = rec;
        rec.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        rec.start();
      })
      .catch(() => {
        pressedRef.current = false;
        micPromiseRef.current = null;
        setError("Mikrofona erişilemedi — tarayıcı iznini kontrol et.");
        setStatus("idle");
      });
  }, []);

  /** Bas-konuş: bırakılınca — transkripti döner. */
  const release = useCallback(async (): Promise<string | null> => {
    if (!pressedRef.current) return null;
    pressedRef.current = false;
    await micPromiseRef.current?.catch(() => undefined);
    micPromiseRef.current = null;
    if (!recRef.current) {
      setStatus("idle");
      return null;
    }
    return await stopAndProcess();
  }, [stopAndProcess]);

  return {
    status, error, timeline,
    getTime, getLevel,
    unlock, speak, sendChat, translate, review, press, release,
    skipSpeaking, setFastForward,
    setStatus, setError,
  };
}

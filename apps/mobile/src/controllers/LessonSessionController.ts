import {
  classifyAck,
  decideAfterTutorReply,
  decideInWrapup,
  decideOnStudentInput,
  isLastExchange,
  matchesAnswerSpec,
  normalizeUtterance,
  type LessonContentV7,
  type RichText,
  type SessionPosition,
  type SessionScript,
} from "@glotmate/contracts";
import { Alert } from "react-native";
import { router } from "expo-router";
import { api, errorCode } from "../api";
import { VoiceService } from "../lib/voice";
import {
  useLessonSessionStore,
  type Awaiting,
  type LessonMessage,
  type LessonResume,
} from "../stores/useLessonSessionStore";

/**
 * DERS AKIŞ MAKİNESİ — web sayfasının (apps/web lesson page) mobil portu,
 * CLAUDE.md desenine dökülmüş hâli: tüm durum store'da, kararlar contracts'taki
 * saf fonksiyonlarda, ekran yalnız okur ve çağırır.
 *
 * KÖK KURALLAR (web'le birebir):
 *  · Karar girdileri YALNIZ: öğrenci sözü, sayaçlar, içerik alanları, yapısal
 *    yanıt alanları (isAttempt/beatDone/segmentDone). Hoca cümlesinin METNİ asla.
 *  · Ders KENDİLİĞİNDEN bitmez — tek çıkış finish() (Dersi Bitir butonu).
 *  · Aktarım hatası deneme hakkı YEMEZ — sayaçlar geri alınır.
 *  · MCQ cevabı buton: submitOption şık metnini normal akışa verir.
 */

type ViewBeat = LessonContentV7["lecture"]["beats"][number];

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

/**
 * Devam yeniden-girişinde aktif beat yeniden sorulur; satır İLK oynatımda
 * zaten transkripte log'landığı için yeniden-soruş LOG'LANMAZ (çift kayıt olmasın).
 */
let suppressTurnLog = false;

const enRuns = (text: string): RichText => [{ lang: "en", text }];
const runsText = (runs: RichText | undefined | null): string =>
  (runs ?? []).map((r) => r.text).join(" ");

const OPTION_LETTERS = ["a", "b", "c", "d"];

/** Yeni hoca balonundan sonra girdinin kilitli kaldığı kısa aralık (web'le aynı) */
const INPUT_GRACE_MS = 500;
let graceTimer: ReturnType<typeof setTimeout> | null = null;

/** Sunucu script'i tamamen düşerse akış durmasın diye son çare metinler (web'le aynı) */
const FALLBACK_PRACTICE_INTRO = enRuns("Nice work! Now let's practise with a short role play.");
const FALLBACK_PRAISE = [enRuns("Exactly right!"), enRuns("Well done!"), enRuns("That's it!"), enRuns("Perfect!")];
const FALLBACK_INVITE = enRuns("Of course! What would you like to know?");
const FALLBACK_WRAPUP = enRuns("That's it for today's lesson - great work! Is there anything you would like to ask me?");
const FALLBACK_FAREWELL = enRuns("Wonderful. Well done today. See you in the next lesson!");

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

/** Alıştırmanın gösterilen VE seslendirilen hâli — şıklar dahil (web kuralı) */
function exerciseRuns(beat: Extract<ViewBeat, { kind: "exercise" }>): RichText {
  if (!beat.options?.length) return beat.runs;
  const optionRuns: RichText = beat.options.map((o, i) => ({
    lang: "en" as const,
    text: `${OPTION_LETTERS[i]!.toUpperCase()}) ${o}`,
  }));
  return [...beat.runs, ...optionRuns];
}

/** v7 cevap eşleştirme — web'deki matchesAnswer'ın portu (harf/numara/şık metni) */
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

interface ChatResult {
  text: string;
  runs?: RichText;
  segmentDone: boolean;
  beatDone?: boolean;
  isAttempt?: boolean;
}

export class LessonSessionController {
  // --- yardımcılar -----------------------------------------------------------

  private static store() {
    return useLessonSessionStore.getState();
  }

  private static pushTeacher(runs: RichText, points?: RichText[]): void {
    const m: LessonMessage = { id: nextId(), role: "teacher", text: runsText(runs), runs, points };
    this.store().pushMessage(m);
    // Yeni metin ekrana düştüğü an kısa bir kilit: kullanıcı okumaya fırsat
    // bulmadan yanlışlıkla sözü kesmesin. Kilit YALNIZCA bu aralıkta; sonrasında
    // söz kesme serbest (web'deki INPUT_GRACE_MS ile aynı).
    this.store().set({ grace: true });
    if (graceTimer) clearTimeout(graceTimer);
    graceTimer = setTimeout(() => this.store().set({ grace: false }), INPUT_GRACE_MS);
  }

  private static pushUser(text: string): void {
    this.store().pushMessage({ id: nextId(), role: "user", text });
  }

  // --- sunucu senkronu (fire-and-forget — ders ASLA bloke olmaz) --------------

  /**
   * Sunucuya ULAŞMAYAN transkript satırlarını logla: script replikleri +
   * istemcide çözülen öğrenci girdileri. Sunucu chat/judge çiftlerini zaten
   * yazıyor — onlar burada ASLA loglanmaz (çift kayıt olur).
   */
  private static logTurn(role: "user" | "assistant", text: string, runs?: RichText): void {
    if (suppressTurnLog) return;
    const { sessionId, phase } = this.store();
    if (!sessionId || phase === "done" || !text.trim()) return;
    void api
      .post(`/v1/sessions/${sessionId}/sync`, {
        turns: [{ role, text: text.slice(0, 2000), runs, phase }],
      })
      .catch(() => undefined);
  }

  /**
   * Pozisyon imleci. `awaiting` çağırandan gelir (store'daki değer konuşma
   * bitene dek null kalır — imleç beklenen HEDEFİ yazmalı). Kaybolan sync
   * devam noktasını en fazla bir-iki adım geri alır, asla ileri almaz.
   */
  private static syncPosition(awaiting: SessionPosition["awaiting"]): void {
    const s = this.store();
    if (!s.sessionId || s.phase === "done") return;
    const beat = s.lesson?.lecture.beats[s.beatIndex];
    const position: SessionPosition = {
      phase: s.phase as SessionPosition["phase"],
      beatId: beat?.id ?? null,
      beatIndex: s.beatIndex,
      awaiting,
      beatExchanges: s.beatExchanges,
      invites: s.invites,
      attempt: s.attempt,
      practiceTurn: s.practiceTurn,
      praiseIndex: s.praiseIndex,
    };
    void api.post(`/v1/sessions/${s.sessionId}/sync`, { position }).catch(() => undefined);
  }

  private static speak(runs: RichText, onEnd: () => void): void {
    const { sessionId, fastForward, stopped } = this.store();
    if (stopped) return; // ekrandan çıkıldı: zincir burada ölür, onEnd ÇAĞRILMAZ
    // İLERİ SARMA: metin balonlara zaten düştü, TTS'e HİÇ gidilmez (bedava) ve
    // zincir aynı yoldan ilerler — yapı bozulmaz, yalnız ses yoktur.
    if (!sessionId || fastForward) {
      this.store().set({ speaking: false });
      onEnd();
      return;
    }
    this.store().set({ speaking: true });
    void VoiceService.speak(sessionId, runs, () => {
      this.store().set({ speaking: false });
      onEnd();
    });
  }

  /**
   * SÖZ KESME. Emma konuşurken öğrenci mikrofona basar ya da yazdığını gönderirse:
   * ses susar, akış cevabın beklendiği ilk noktaya kadar SESSİZ ilerler (balonlar
   * görünmeye devam eder), sonra girdi oraya teslim edilir.
   *
   * SIRA KRİTİK: kuyruk `skipSpeaking`ten ÖNCE kurulur. `skipSpeaking` bekleyen
   * `onEnd`'i SENKRON çalıştırır; o zincir aynı karede `arrive()`a kadar koşabilir
   * ve sonra kurulan bir kuyruğu göremez — söz kaybolur, sonraki turda hayalet
   * olarak geri gelirdi.
   */
  private static bargeIn(text?: string): void {
    this.store().set({ fastForward: true, speaking: false, ...(text ? { pendingInput: text } : {}) });
    VoiceService.skipSpeaking();
  }

  /**
   * Akış bir bekleme noktasına vardı — `awaiting`in TEK yazarı.
   *
   * İleri sarma tam burada kapanır: girdiye bağlamak yanlıştı, çünkü öğrenci
   * mikrofona basıp hiç konuşmayabilir (STT boş döner, handleUserText hiç
   * çağrılmaz) ve dersin geri kalanı sessiz oynardı.
   */
  private static arrive(awaiting: Exclude<Awaiting, null>): void {
    this.store().set({ awaiting, fastForward: false });
    this.deliverPending();
  }

  /**
   * Kuyruktaki sözü teslim et. Mikrofon BASILIYKEN teslim edilmez: hocanın cevabı
   * kaydın içine konuşur ve STT onu öğrencinin sözü sanır — bırakışta releaseMic
   * devralır.
   */
  private static deliverPending(): void {
    const { awaiting, pendingInput, recording } = this.store();
    if (!awaiting || !pendingInput || recording) return;
    this.store().set({ pendingInput: null });
    void this.handleUserText(pendingInput);
  }

  private static async chat(
    text: string,
    ctx: { phase: string; beatId?: string; turnIndex?: number; attempt?: number; lastExchange?: boolean },
  ): Promise<ChatResult | null> {
    const { sessionId } = this.store();
    if (!sessionId) return null;
    this.store().set({ busy: true });
    try {
      const res = await api.post(`/v1/sessions/${sessionId}/chat`, { text, ...ctx });
      return res.data as ChatResult;
    } catch {
      return null; // aktarım hatası — çağıran sayaçları geri alır
    } finally {
      this.store().set({ busy: false });
    }
  }

  // --- yaşam döngüsü ----------------------------------------------------------

  /**
   * Ekran açılışı: yalnız İÇERİK ÖNİZLEMESİ + devam sorgusu. Oturum BURADA
   * AÇILMAZ (eskiden mount'ta açılıyordu — karta bakıp çıkmak bile oturum ve
   * session_count üretiyordu). Oturumu start() kurar, web'le aynı desen.
   */
  static async open(catalogLessonId: string): Promise<void> {
    const store = this.store();
    store.reset();
    store.set({ catalogLessonId });
    await VoiceService.init();
    try {
      const [lessonRes, resumeRes, avatarRes] = await Promise.all([
        api.get(`/v1/lessons/${catalogLessonId}`),
        // Devam sorgusu düşerse ders yine açılır — sadece "Devam et" sunulmaz
        api.get(`/v1/lessons/${catalogLessonId}/resume`).catch(() => null),
        // Aktif avatar (admin ayarı) — düşerse varsayılan fatman kalır
        api.get(`/v1/avatar`).catch(() => null),
      ]);
      const { lesson } = lessonRes.data as { lesson: LessonContentV7 };
      const resume = (resumeRes?.data as { resume: LessonResume | null } | undefined)?.resume ?? null;
      const avatarId = (avatarRes?.data as { activeId?: string } | undefined)?.activeId ?? "fatman";
      this.store().set({ lesson, resume, avatarId });
    } catch (err) {
      this.store().set({ loadError: errorCode(err) });
    }
  }

  /** "Derse başla" / "Baştan başla" sonrası: oturumu kur, ilk beat'i konuştur. */
  static async start(): Promise<void> {
    const { started, catalogLessonId } = this.store();
    if (started || !catalogLessonId) return;
    this.store().set({ started: true, busy: true });
    try {
      const res = await api.post(`/v1/lessons/${catalogLessonId}/sessions`, {});
      const { sessionId, script, lesson } = res.data as {
        sessionId: string;
        script: SessionScript;
        lesson: LessonContentV7;
      };
      this.store().set({ sessionId, script, lesson, resume: null });
      this.enterBeat();
    } catch (err) {
      this.store().set({ loadError: errorCode(err), started: false });
    } finally {
      this.store().set({ busy: false });
    }
  }

  /** "Baştan başla": açık oturumu TERK EDİLMİŞ kapat (ders tamamlanmaz), yenisini kur. */
  static async restart(): Promise<void> {
    const { resume } = this.store();
    if (resume) {
      await api
        .post(`/v1/sessions/${resume.sessionId}/end`, { outcome: "abandoned" })
        .catch(() => undefined); // openSession zaten eski açıkları kapatıyor — emniyet kemeri
      this.store().set({ resume: null });
    }
    await this.start();
  }

  /**
   * "Kaldığın yerden devam et" — AYNI oturum sürer (practice hitTurns ve LLM
   * bağlamı oturuma bağlı). Geçmiş balonlar transkriptten, pozisyon imleçten.
   */
  static resume(): void {
    const { resume, started } = this.store();
    if (!resume || started) return;
    const p = resume.position;

    const messages: LessonMessage[] = resume.transcript.map((t) => ({
      id: `t${t.id}`, // sunucu satır kimliği — taze m${seq} kimlikleriyle çakışmaz
      role: t.role === "user" ? "user" : "teacher",
      text: t.text,
      runs: t.runs ?? undefined,
    }));

    this.store().set({
      sessionId: resume.sessionId,
      script: resume.script,
      lesson: resume.lesson,
      resume: null,
      started: true,
      messages,
      phase: p.phase,
      beatIndex: p.beatIndex,
      practiceTurn: p.practiceTurn,
      praiseIndex: p.praiseIndex,
    });

    if (p.phase === "lecture") {
      if (p.awaiting === null) {
        // say/teach ORTASINDA çıkılmış: içerik geçmiş balonlarda zaten duruyor —
        // aynı beat'i baştan çalmak her şeyi tekrarlatıyordu (canlı şikâyet,
        // 16 Eyl). Bir SONRAKİ beat'ten sür (son beat'se practice başlar).
        // Ödün: yarıda kesilen anlatımın sesi tekrarlanmaz, metin ekranda okunur.
        this.advance();
        return;
      }
      // Soru bekleyen beat (ask/exercise/open_response): soru yeniden sorulur
      // (göster + seslendir) — cevap verebilmek için duymak gerekir. Satır ilk
      // oynatımda log'landı — yeniden-soruş log'lanmaz. enterBeat sayaçları
      // sıfırladığı için beat-içi sayaçlar ondan SONRA geri yüklenir: "yanlış +
      // çık + devam + yanlış" üçüncü hak DOĞURMAZ.
      suppressTurnLog = true;
      try {
        this.enterBeat();
      } finally {
        suppressTurnLog = false;
      }
      this.store().set({ attempt: p.attempt, beatExchanges: p.beatExchanges, invites: p.invites });
      return;
    }

    // Practice/wrapup: intro/wrapup cümlesi geçmiş balonlarda zaten var —
    // tekrarlamadan sessizce girişi aç. (startPractice/startWrapup çağrılMAZ:
    // faz zaten kurulu, idempotens korumaları da zaten girişi engellerdi.)
    this.arrive(p.phase === "practice" ? "practice" : "wrapup");
  }

  /** Ekrandan çıkış: sesi sustur. Oturumu KAPATMAZ — bitiren yalnız finish(). */
  static leave(): void {
    // `stopped`: ileri sarma ağ beklemediği için ekran kapandıktan sonra saniyeler
    // süren bir hayalet zincir bırakabilirdi (balon + transkript + imleç yazardı).
    this.store().set({ stopped: true, fastForward: false, pendingInput: null });
    VoiceService.stopAll();
  }

  /**
   * ✕ ÇIKIŞTIR, BİTİRME DEĞİL: ses susar, oturum AÇIK kalır (pozisyon zaten
   * sync'li) — sonraki girişte "Kaldığın yerden devam et" sunulur. Canlı hata:
   * ✕ finish()'e bağlıydı; her çıkış oturumu kapatıp dersi TAMAMLANDI
   * işaretliyordu, devam hiç tetiklenmiyordu.
   */
  static exit(): void {
    this.store().set({ stopped: true, fastForward: false, pendingInput: null });
    VoiceService.stopAll();
    router.back();
  }

  /** ✕ önce onay sorar — yanlışlıkla dokunuş dersi kesmesin. Çıkış exit()'te. */
  static confirmExit(): void {
    Alert.alert("Dersten çık?", "İlerlemen kaydedildi — sonra kaldığın yerden devam edebilirsin.", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çık", style: "destructive", onPress: () => this.exit() },
    ]);
  }

  /** TEK BİTİRİCİ — wrapup'taki "Dersi Bitir" butonu (kök kural: ders kendiliğinden bitmez). */
  static async finish(): Promise<void> {
    const { sessionId } = this.store();
    this.store().set({ phase: "done", awaiting: null, stopped: true, fastForward: false, pendingInput: null });
    VoiceService.stopAll();
    if (sessionId) await api.post(`/v1/sessions/${sessionId}/end`, {}).catch(() => undefined);
    router.back();
  }

  // --- beat makinesi ----------------------------------------------------------

  /** Aktif beat'e giriş: hoca konuşur, gerekiyorsa cevap bekler (web'deki effect) */
  private static enterBeat(): void {
    const { lesson, script, beatIndex, phase } = this.store();
    if (!lesson || phase !== "lecture") return;
    const beat = lesson.lecture.beats[beatIndex];
    if (!beat) return;
    this.store().set({ attempt: 0, beatExchanges: 0, invites: 0, hint: null });

    switch (beat.kind) {
      case "say": {
        const line = spokenLine(beat, script);
        this.pushTeacher(line);
        this.logTurn("assistant", runsText(line), line);
        this.syncPosition(null);
        this.speak(line, () => setTimeout(() => this.advance(), 300));
        break;
      }
      case "ask": {
        const line = spokenLine(beat, script);
        this.pushTeacher(line);
        this.logTurn("assistant", runsText(line), line);
        this.syncPosition("ask");
        this.speak(line, () => this.arrive("ask"));
        break;
      }
      case "teach": {
        const line = spokenLine(beat, script);
        const pointRuns = beat.points.map((p) => p.runs);
        this.pushTeacher(line);
        this.logTurn("assistant", runsText(line), line);
        this.syncPosition(null);
        this.speak(line, () => {
          this.pushTeacher([], pointRuns);
          this.logTurn("assistant", runsText(pointRuns.flat()), pointRuns.flat());
          // Maddeler tek konuşmada: parçalar dil etiketli, TTS doğru okur
          this.speak(pointRuns.flat(), () => setTimeout(() => this.advance(), 400));
        });
        break;
      }
      case "exercise": {
        const asked = exerciseRuns(beat);
        this.pushTeacher(asked);
        this.logTurn("assistant", runsText(asked), asked);
        this.syncPosition("exercise");
        this.speak(asked, () => this.arrive("exercise"));
        break;
      }
      case "open_response": {
        this.pushTeacher(beat.runs);
        this.logTurn("assistant", runsText(beat.runs), beat.runs);
        this.syncPosition("open_response");
        this.speak(beat.runs, () => this.arrive("open_response"));
        break;
      }
    }
  }

  private static advance(): void {
    const { lesson, beatIndex } = this.store();
    if (!lesson) return;
    const next = beatIndex + 1;
    if (next >= lesson.lecture.beats.length) {
      setTimeout(() => this.startPractice(), 500);
      return;
    }
    this.store().set({ beatIndex: next });
    this.enterBeat();
  }

  private static startPractice(): void {
    const { lesson, script, phase } = this.store();
    if (!lesson || phase === "practice") return; // idempotent
    this.store().set({ phase: "practice", practiceTurn: 0 });
    const intro = script?.practiceIntro?.length ? script.practiceIntro : FALLBACK_PRACTICE_INTRO;
    this.pushTeacher(intro);
    this.logTurn("assistant", runsText(intro), intro);
    this.syncPosition("practice");
    this.speak(intro, () => {
      // Rol yapma TAMAMEN İngilizce — sahnenin ilk repliği içerikten
      const opening = enRuns(lesson.practice.avatarOpening);
      this.pushTeacher(opening);
      this.logTurn("assistant", lesson.practice.avatarOpening, opening);
      this.speak(opening, () => this.arrive("practice"));
    });
  }

  private static startWrapup(): void {
    const { script, phase } = this.store();
    if (phase === "wrapup" || phase === "done") return; // idempotent
    this.store().set({ phase: "wrapup" });
    const line = script?.wrapup?.length ? script.wrapup : FALLBACK_WRAPUP;
    this.pushTeacher(line);
    this.logTurn("assistant", runsText(line), line);
    this.syncPosition("wrapup");
    this.speak(line, () => this.arrive("wrapup"));
  }

  // --- kullanıcı girdisi --------------------------------------------------------

  /** MCQ butonu — şık METNİ normal akışa girer; yeni akış yolu YOK (web'le aynı) */
  static submitOption(option: string): void {
    void this.handleUserText(option);
  }

  static async handleUserText(text: string): Promise<void> {
    const s = this.store();
    const { lesson, script, awaiting, beatIndex } = s;
    if (!lesson || s.stopped) return;
    // SÖZ KESME: hoca hâlâ konuşuyor (`awaiting === null`). Sesi kes, akışı ileri
    // sar; söz cevabın beklendiği ilk noktada teslim edilir (bkz. arrive).
    if (!awaiting) return this.bargeIn(text);
    this.pushUser(text);
    s.set({ hint: null });
    const beat = lesson.lecture.beats[beatIndex];
    const ack = (t: string) => classifyAck(t, lesson.ui.ack);

    // --- PRACTICE: turlar sunucuda ölçülür, segmentDone kapanışı başlatır -----
    if (awaiting === "practice") {
      s.set({ awaiting: null });
      const turnIndex = s.practiceTurn;
      this.store().set({ practiceTurn: turnIndex + 1 });
      const res = await this.chat(text, { phase: "practice", turnIndex });
      if (!res) {
        this.store().set({ practiceTurn: turnIndex }); // hata tur yemez
        this.arrive("practice");
        return;
      }
      const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
      this.pushTeacher(replyRuns);
      this.syncPosition("practice"); // tur ilerledi — imleç güncel (çift server'da)
      this.speak(replyRuns, () => {
        if (res.segmentDone) setTimeout(() => this.startWrapup(), 500);
        else this.arrive("practice");
      });
      return;
    }

    // --- WRAPUP: hiçbir dal dersi bitirmez — tek çıkış "Dersi Bitir" ----------
    if (awaiting === "wrapup") {
      const decision = decideInWrapup(ack(text));
      if (decision.kind === "farewell") {
        s.set({ awaiting: null });
        const bye = script?.farewell?.length ? script.farewell : FALLBACK_FAREWELL;
        this.pushTeacher(bye);
        this.logTurn("user", text); // istemcide çözüldü — sunucuya hiç gitmedi
        this.logTurn("assistant", runsText(bye), bye);
        this.speak(bye, () => this.arrive("wrapup"));
        return;
      }
      if (decision.kind === "invite") {
        s.set({ awaiting: null });
        const invite = script?.inviteQuestion?.length ? script.inviteQuestion : FALLBACK_INVITE;
        this.pushTeacher(invite);
        this.logTurn("user", text);
        this.logTurn("assistant", runsText(invite), invite);
        this.speak(invite, () => this.arrive("wrapup"));
        return;
      }
      s.set({ awaiting: null });
      const res = await this.chat(text, { phase: "wrapup" });
      if (!res) return this.arrive("wrapup");
      const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
      this.pushTeacher(replyRuns);
      this.speak(replyRuns, () => this.arrive("wrapup"));
      return;
    }

    if (!beat) return;

    // --- LECTURE: karar saf makineden (kök kural: hoca metni girdi DEĞİL) -----
    const before = decideOnStudentInput(beat, {
      ack: ack(text),
      exchanges: s.beatExchanges,
      invites: s.invites,
      attempt: s.attempt,
      answerMatched: beat.kind === "exercise" ? matchesAnswer(text, beat) : false,
    });

    if (before.kind === "advance") {
      s.set({ awaiting: null });
      this.logTurn("user", text); // ack istemcide çözüldü — transkriptte de dursun
      setTimeout(() => this.advance(), 250);
      return;
    }

    if (before.kind === "invite") {
      // Davet LLM'e gitmez, soru bütçesinden yemez — ayrı sayaç (web'le aynı)
      this.store().set({ invites: s.invites + 1, awaiting: null });
      const invite = script?.inviteQuestion?.length ? script.inviteQuestion : FALLBACK_INVITE;
      this.pushTeacher(invite);
      this.logTurn("user", text);
      this.logTurn("assistant", runsText(invite), invite);
      this.syncPosition("ask");
      this.speak(invite, () => this.arrive("ask"));
      return;
    }

    if (before.kind === "praise") {
      s.set({ awaiting: null });
      const pool = script?.praise?.length ? script.praise : FALLBACK_PRAISE;
      const praise = pool[s.praiseIndex % pool.length]!;
      this.store().set({ praiseIndex: s.praiseIndex + 1 });
      this.pushTeacher(praise);
      // Birebir doğru cevap sunucuya HİÇ gitmiyor — transkriptteki tek izi bu
      this.logTurn("user", text);
      this.logTurn("assistant", runsText(praise), praise);
      this.speak(praise, () => setTimeout(() => this.advance(), 300));
      return;
    }

    // before.kind === "askTutor" — judge/sohbet çağrısı
    const waitingKind = awaiting;
    s.set({ awaiting: null });
    const attempt = s.attempt;
    const lastExchange = isLastExchange(beat, s.beatExchanges);
    this.store().set({ beatExchanges: s.beatExchanges + 1, attempt: attempt + 1 });

    const res = await this.chat(text, { phase: "lecture", beatId: beat.id, attempt, lastExchange });
    if (!res) {
      // Aktarım hatası deneme hakkı YEMEZ — sayaçlar geri alınır (web'le aynı)
      this.store().set({ beatExchanges: s.beatExchanges, attempt });
      this.arrive(waitingKind);
      return;
    }
    if (res.isAttempt === false) this.store().set({ attempt });

    const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
    this.pushTeacher(replyRuns);
    const after = decideAfterTutorReply(beat, {
      exchanges: this.store().beatExchanges,
      attempt,
      beatDone: res.beatDone ?? false, // yokluğu "bitmedi" say — beat erken kapanmaz
      // Sunucu judge yollarında hep gönderir; yokluğu "deneme" say (güvenli taraf)
      isAttempt: res.isAttempt ?? true,
    });
    if (after.kind === "wait") this.syncPosition(after.awaiting); // sayaçlar güncel — imleç de

    // DETERMİNİSTİK YENİDEN-SORMA: girdi cevap değildi (yardım/rica/selam —
    // yapısal isAttempt=false) ve beklemeye dönülüyorsa SORUNUN KENDİSİ
    // içerikten birebir yeniden basılır ve seslendirilir. Judge'a "soruyu
    // yeniden yaz" demek canlıda soru UYDURTTU ("Please introduce yourself." —
    // madde bambaşkaydı); soru içerik alanıdır, modele yazdırılmaz. Satır ilk
    // gösterimde log'landı — tekrar log'lanmaz (suppress, resume deseniyle aynı).
    const reAsk =
      after.kind === "wait" &&
      res.isAttempt === false &&
      (beat.kind === "exercise" || beat.kind === "open_response")
        ? beat.kind === "exercise"
          ? exerciseRuns(beat)
          : beat.runs
        : null;

    this.speak(replyRuns, () => {
      if (after.kind !== "wait") {
        setTimeout(() => this.advance(), 300);
        return;
      }
      if (!reAsk) {
        this.arrive(after.awaiting);
        return;
      }
      suppressTurnLog = true;
      try {
        this.pushTeacher(reAsk);
      } finally {
        suppressTurnLog = false;
      }
      this.speak(reAsk, () => this.arrive(after.awaiting));
    });
  }

  // --- mikrofon ---------------------------------------------------------------

  static async pressMic(): Promise<void> {
    const { awaiting, busy, stopped } = this.store();
    if (busy || stopped) return; // sunucu düşünüyor: cevabın gideceği yer belli değil
    // SÖZ KESME: hoca konuşurken mikrofona basmak onu susturur ve akışı ileri
    // sarar. Kaydın sonucu bırakışta işlenir; akış o ana kadar bekleme noktasına
    // varmadıysa söz kuyruğa girer.
    if (!awaiting) this.bargeIn();
    // Bayrak BASIŞ ANINDA kurulur (iyimser): startRecording'in async hazırlığı
    // ~200-400ms sürüyor; bayrak await'ten sonra kurulunca kısa basışta
    // releaseMic bayrağı false görüp hiç göndermiyordu.
    this.store().set({ recording: true });
    const ok = await VoiceService.startRecording();
    if (!ok) this.store().set({ recording: false });
  }

  static async releaseMic(): Promise<void> {
    const { sessionId, recording } = this.store();
    this.store().set({ recording: false });
    if (!sessionId || !recording) return;
    const text = await VoiceService.stopRecording(sessionId);
    if (text) return void this.handleUserText(text); // null (kısa/boş) hak yemez
    // Kayıt boş çıktı. Mikrofon basılıyken teslim edilemeyen bir söz varsa
    // (önce yazılmış, sonra araya girilmiş) sırası ŞİMDİ geldi.
    this.deliverPending();
  }

  // --- ipucu ------------------------------------------------------------------

  static showHint(): void {
    const { lesson, awaiting, beatIndex } = this.store();
    if (!lesson) return;
    const beat = lesson.lecture.beats[beatIndex];
    if (awaiting === "exercise" && beat?.kind === "exercise") this.store().set({ hint: beat.hint });
    else if (awaiting === "open_response" && beat?.kind === "open_response") this.store().set({ hint: beat.hint });
    else if (awaiting === "practice") {
      this.store().set({
        hint: [
          // Chrome etiketi tutor diline göre: english modda bu etiket İngilizce'dir
          { lang: lesson.tutorLanguage === "native" ? ("l1" as const) : ("en" as const), text: lesson.ui.labels.practiceHint },
          ...lesson.practice.mustUse.map((m) => ({ lang: "en" as const, text: m, emphasis: true })),
        ],
      });
    }
  }
}

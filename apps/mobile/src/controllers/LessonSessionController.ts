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
  type SessionScript,
} from "@arna/contracts";
import { router } from "expo-router";
import { api, errorCode } from "../api";
import { VoiceService } from "../lib/voice";
import { useLessonSessionStore, type LessonMessage } from "../stores/useLessonSessionStore";

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

const enRuns = (text: string): RichText => [{ lang: "en", text }];
const runsText = (runs: RichText | undefined | null): string =>
  (runs ?? []).map((r) => r.text).join(" ");

const OPTION_LETTERS = ["a", "b", "c", "d"];

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
  }

  private static pushUser(text: string): void {
    this.store().pushMessage({ id: nextId(), role: "user", text });
  }

  private static speak(runs: RichText, onEnd: () => void): void {
    const { sessionId } = this.store();
    if (!sessionId) return onEnd();
    this.store().set({ speaking: true });
    void VoiceService.speak(sessionId, runs, () => {
      this.store().set({ speaking: false });
      onEnd();
    });
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

  /** Oturum aç, içerik+script'i store'a koy. Konuşma start() ile başlar. */
  static async open(catalogLessonId: string): Promise<void> {
    const store = this.store();
    store.reset();
    await VoiceService.init();
    try {
      const res = await api.post(`/v1/lessons/${catalogLessonId}/sessions`, {});
      const { sessionId, script, lesson } = res.data as {
        sessionId: string;
        script: SessionScript;
        lesson: LessonContentV7;
      };
      this.store().set({ sessionId, script, lesson });
    } catch (err) {
      this.store().set({ loadError: errorCode(err) });
    }
  }

  /** "Derse başla" — ilk beat'i konuştur. (Web'deki unlock kapısının karşılığı.) */
  static start(): void {
    if (this.store().started) return;
    this.store().set({ started: true });
    this.enterBeat();
  }

  /** Ekrandan çıkış: sesi sustur. Oturumu KAPATMAZ — bitiren yalnız finish(). */
  static leave(): void {
    VoiceService.stopAll();
  }

  /** TEK BİTİRİCİ — "Dersi Bitir" butonu (kök kural: ders kendiliğinden bitmez). */
  static async finish(): Promise<void> {
    const { sessionId } = this.store();
    this.store().set({ phase: "done", awaiting: null });
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
        this.speak(line, () => setTimeout(() => this.advance(), 300));
        break;
      }
      case "ask": {
        const line = spokenLine(beat, script);
        this.pushTeacher(line);
        this.speak(line, () => this.store().set({ awaiting: "ask" }));
        break;
      }
      case "teach": {
        const line = spokenLine(beat, script);
        const pointRuns = beat.points.map((p) => p.runs);
        this.pushTeacher(line);
        this.speak(line, () => {
          this.pushTeacher([], pointRuns);
          // Maddeler tek konuşmada: parçalar dil etiketli, TTS doğru okur
          this.speak(pointRuns.flat(), () => setTimeout(() => this.advance(), 400));
        });
        break;
      }
      case "exercise": {
        const asked = exerciseRuns(beat);
        this.pushTeacher(asked);
        this.speak(asked, () => this.store().set({ awaiting: "exercise" }));
        break;
      }
      case "open_response": {
        this.pushTeacher(beat.runs);
        this.speak(beat.runs, () => this.store().set({ awaiting: "open_response" }));
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
    this.speak(intro, () => {
      // Rol yapma TAMAMEN İngilizce — sahnenin ilk repliği içerikten
      const opening = enRuns(lesson.practice.avatarOpening);
      this.pushTeacher(opening);
      this.speak(opening, () => this.store().set({ awaiting: "practice" }));
    });
  }

  private static startWrapup(): void {
    const { script, phase } = this.store();
    if (phase === "wrapup" || phase === "done") return; // idempotent
    this.store().set({ phase: "wrapup" });
    const line = script?.wrapup?.length ? script.wrapup : FALLBACK_WRAPUP;
    this.pushTeacher(line);
    this.speak(line, () => this.store().set({ awaiting: "wrapup" }));
  }

  // --- kullanıcı girdisi --------------------------------------------------------

  /** MCQ butonu — şık METNİ normal akışa girer; yeni akış yolu YOK (web'le aynı) */
  static submitOption(option: string): void {
    void this.handleUserText(option);
  }

  static async handleUserText(text: string): Promise<void> {
    const s = this.store();
    const { lesson, script, awaiting, beatIndex } = s;
    if (!lesson || !awaiting) return;
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
        this.store().set({ practiceTurn: turnIndex, awaiting: "practice" }); // hata tur yemez
        return;
      }
      const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
      this.pushTeacher(replyRuns);
      this.speak(replyRuns, () => {
        if (res.segmentDone) setTimeout(() => this.startWrapup(), 500);
        else this.store().set({ awaiting: "practice" });
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
        this.speak(bye, () => this.store().set({ awaiting: "wrapup" }));
        return;
      }
      if (decision.kind === "invite") {
        s.set({ awaiting: null });
        const invite = script?.inviteQuestion?.length ? script.inviteQuestion : FALLBACK_INVITE;
        this.pushTeacher(invite);
        this.speak(invite, () => this.store().set({ awaiting: "wrapup" }));
        return;
      }
      s.set({ awaiting: null });
      const res = await this.chat(text, { phase: "wrapup" });
      if (!res) return this.store().set({ awaiting: "wrapup" });
      const replyRuns = res.runs?.length ? res.runs : enRuns(res.text);
      this.pushTeacher(replyRuns);
      this.speak(replyRuns, () => this.store().set({ awaiting: "wrapup" }));
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
      setTimeout(() => this.advance(), 250);
      return;
    }

    if (before.kind === "invite") {
      // Davet LLM'e gitmez, soru bütçesinden yemez — ayrı sayaç (web'le aynı)
      this.store().set({ invites: s.invites + 1, awaiting: null });
      const invite = script?.inviteQuestion?.length ? script.inviteQuestion : FALLBACK_INVITE;
      this.pushTeacher(invite);
      this.speak(invite, () => this.store().set({ awaiting: "ask" }));
      return;
    }

    if (before.kind === "praise") {
      s.set({ awaiting: null });
      const pool = script?.praise?.length ? script.praise : FALLBACK_PRAISE;
      const praise = pool[s.praiseIndex % pool.length]!;
      this.store().set({ praiseIndex: s.praiseIndex + 1 });
      this.pushTeacher(praise);
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
      this.store().set({ beatExchanges: s.beatExchanges, attempt, awaiting: waitingKind });
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
    this.speak(replyRuns, () => {
      if (after.kind === "wait") this.store().set({ awaiting: after.awaiting });
      else setTimeout(() => this.advance(), 300);
    });
  }

  // --- mikrofon ---------------------------------------------------------------

  static async pressMic(): Promise<void> {
    if (!this.store().awaiting) return; // v1: söz kesme yok — konuşurken kilitli
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
    if (text) await this.handleUserText(text); // null (kısa/boş) hak yemez
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
          { lang: "l1", text: lesson.ui.labels.practiceHint },
          ...lesson.practice.mustUse.map((m) => ({ lang: "en" as const, text: m, emphasis: true })),
        ],
      });
    }
  }
}

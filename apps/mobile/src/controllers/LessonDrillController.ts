import {
  SPEAK_MAX_ATTEMPTS,
  currentDrill,
  formatDrillTurn,
  gradeDrill,
  initialDrillState,
  nextDrillStep,
  settleDrillCursor,
  skipSpeakDrills,
  type DrillAnswer,
  type DrillItem,
  type RichText,
} from "@glotmate/contracts";
import { api } from "../api";
import { tr } from "../i18n/tr";
import { VoiceService } from "../lib/voice";
import { HapticsService } from "../services/HapticsService";
import { SoundService } from "../services/SoundService";
import { useLessonSessionStore } from "../stores/useLessonSessionStore";
import { drillCorrectText, drillItemKey, drillPromptText } from "../domain/drills";
import { LessonSync } from "./LessonSync";

/**
 * OYUN BLOĞU — dersteki klavyesiz alıştırma bölümü (10 Kas 2026).
 *
 * Anlatım bitip hoca "alıştırmalara geçelim" dediğinde LessonSessionController
 * `drills` beat'ine girer ve kontrolü buraya verir; blok bitince rol yapmaya
 * kendisi geri döner (`afterDrills`). Sohbet akışı (lessonFlow) bloğu HİÇ görmez.
 *
 * KÖK KURALLAR:
 *  · Puan ve sıra kararı contracts `drillGrade`'dedir (gradeDrill, nextDrillStep) —
 *    burada yalnız G/Ç: ses, kayıt, çeviri, senkron. LLM çağrısı YOK.
 *  · Yanlış cevap hak yakmaz, can yoktur: doğrusu gösterilir, madde blok sonunda
 *    bir kez daha gelir. Konuşma kartı iki denemeden sonra cezasız geçer (STT kaynaklı
 *    ret öğrencinin hatası olmayabilir).
 *  · Blok durumu pozisyona yazılır — bloğun ortasında çıkan öğrenci aynı maddeden sürer.
 */

/** Transkript (admin bug avı) için öğrencinin cevabı — okunur tek satır */
function answerText(item: DrillItem, answer: DrillAnswer): string {
  switch (answer.kind) {
    case "choice":
      return "options" in item ? (item.options[answer.index] ?? "?") : "?";
    case "tokens":
      return answer.tokens.join(" ");
    case "tap":
      return item.type === "find_error" ? (item.sentence.split(" ")[answer.index] ?? "?") : "?";
    case "match":
      return `${answer.mistakes} mistake(s)`;
    case "speech":
      return answer.text;
  }
}

export class LessonDrillController {
  private static store() {
    return useLessonSessionStore.getState();
  }

  /** Aktif beat oyun bloğuysa maddeleri */
  private static items(): DrillItem[] | null {
    const { lesson, beatIndex } = this.store();
    const beat = lesson?.lecture.beats[beatIndex];
    return beat?.kind === "drills" ? beat.items : null;
  }

  private static current(): DrillItem | null {
    const items = this.items();
    const { drill } = this.store();
    return items && drill ? currentDrill(items, drill) : null;
  }

  /** Bloğa giriş — devam ediliyorsa pozisyondaki durumdan sürer */
  static begin(): void {
    const items = this.items();
    if (!items) return;
    const drill = settleDrillCursor(items, this.store().drill ?? initialDrillState());
    this.store().set({
      drill,
      drillVerdict: null,
      drillSpeakAttempts: 0,
      drillHeard: null,
      drillSummary: null,
      drillTranslation: null,
      hint: null,
    });
    LessonSync.syncPosition("drills");
    if (!currentDrill(items, drill)) {
      this.complete();
      return;
    }
    this.onItemShown();
  }

  /**
   * Yeni madde ekranda: dinleme maddesi ve konuşma kartı sesi kendiliğinden çalar —
   * konuşma kartında öğrenci önce doğru telaffuzu duyar ("Tekrar dinle" adı da buradan).
   */
  private static onItemShown(): void {
    const item = this.current();
    if (item?.type === "listen_choose" || item?.type === "listen_arrange") this.play(item.audio);
    else if (item?.type === "speak") this.play(item.sentence);
  }

  /** İngilizce cümleyi seslendir (dinleme maddesi, konuşma kartı örneği) — avatar ağzı da oynar */
  static play(text: string): void {
    const { sessionId, stopped } = this.store();
    if (!sessionId || stopped) return;
    const runs: RichText = [{ lang: "en", text }];
    this.store().set({ speaking: true });
    void VoiceService.speak(
      sessionId,
      runs,
      () => this.store().set({ speaking: false }),
      () => LessonSync.notify(tr.notice.audioFailed),
    );
  }

  private static stopAudio(): void {
    VoiceService.stopPlayback();
    if (this.store().speaking) this.store().set({ speaking: false });
  }

  /** Sonuç anı: dokunsal + ses + transkript satırı */
  private static settle(item: DrillItem, answer: DrillAnswer, ok: boolean): void {
    const { drill } = this.store();
    if (!drill) return;
    if (ok) {
      HapticsService.success();
      SoundService.correct();
    } else {
      HapticsService.warning();
      SoundService.wrong();
    }
    this.store().set({ drillVerdict: { itemKey: drillItemKey(item, drill), ok }, hint: null });
    LessonSync.logTurns([
      {
        role: "user",
        text: formatDrillTurn({
          ok,
          type: item.type,
          prompt: drillPromptText(item),
          answer: answerText(item, answer),
          expected: ok ? null : drillCorrectText(item),
        }),
        source: "drill",
      },
    ]);
  }

  /** "Kontrol et" — dokunarak cevaplanan maddeler (ve eşleştirmenin bitişi) */
  static check(answer: DrillAnswer): void {
    const item = this.current();
    if (!item || this.store().drillVerdict) return;
    this.stopAudio();
    this.settle(item, answer, gradeDrill(item, answer));
  }

  /** Konuşma kartı sonucu — yanlışsa denemeler bitene dek aynı kartta kalınır */
  private static submitSpeech(text: string): void {
    const item = this.current();
    if (!item || item.type !== "speak" || this.store().drillVerdict) return;
    const answer: DrillAnswer = { kind: "speech", text };
    const ok = gradeDrill(item, answer);
    const attempts = this.store().drillSpeakAttempts + 1;
    this.store().set({ drillSpeakAttempts: attempts, drillHeard: text });
    if (ok || attempts >= SPEAK_MAX_ATTEMPTS) {
      this.settle(item, answer, ok);
      return;
    }
    HapticsService.warning();
  }

  /** "Devam" — sıradaki madde ya da blok özeti */
  static next(): void {
    const items = this.items();
    const { drill, drillVerdict } = this.store();
    if (!items || !drill || !drillVerdict) return;
    this.stopAudio();
    const state = nextDrillStep(items, drill, drillVerdict.ok);
    this.store().set({
      drill: state,
      drillVerdict: null,
      drillSpeakAttempts: 0,
      drillHeard: null,
      drillTranslation: null,
      hint: null,
    });
    LessonSync.syncPosition("drills");
    if (!currentDrill(items, state)) this.complete();
    else this.onItemShown();
  }

  /** "Şu an konuşamıyorum" — bu bloktaki konuşma kartları atlanır (yanlış sayılmaz) */
  static cantSpeak(): void {
    const items = this.items();
    const { drill } = this.store();
    if (!items || !drill) return;
    this.stopAudio();
    const state = skipSpeakDrills(items, drill);
    this.store().set({ drill: state, drillVerdict: null, drillSpeakAttempts: 0, drillHeard: null, recording: false });
    LessonSync.syncPosition("drills");
    if (!currentDrill(items, state)) this.complete();
    else this.onItemShown();
  }

  private static complete(): void {
    const items = this.items();
    const { drill } = this.store();
    if (!items || !drill) return;
    HapticsService.success();
    this.store().set({ drillSummary: { ok: drill.firstTry.length, total: items.length } });
  }

  /** Blok kapanır (LessonSessionController.afterDrills çağırır — ders rol yapmayla sürer) */
  static close(): void {
    this.stopAudio();
    this.store().set({ drill: null, drillSummary: null, drillVerdict: null, drillTranslation: null, hint: null });
  }

  /** "Konuyu hatırla" / üst bardaki ipucu — maddenin öğretim noktasının anlatımı */
  static recall(): void {
    const { lesson, hint } = this.store();
    const item = this.current();
    if (!lesson || !item) return;
    if (hint) {
      this.store().set({ hint: null });
      return;
    }
    const points = lesson.lecture.beats.flatMap((b) => (b.kind === "teach" ? b.points : []));
    const picked = item.pointRef === "mix" ? points : points.filter((p) => p.id === item.pointRef);
    const runs = (picked.length ? picked : points).flatMap((p) => p.runs);
    if (runs.length) this.store().set({ hint: runs });
  }

  /** Dokun-çevir: aynı metne ikinci dokunuş kapatır. Sonuç sunucuda önbellekli. */
  static async translate(source: string): Promise<void> {
    const { sessionId, drillTranslation } = this.store();
    if (!sessionId) return;
    if (drillTranslation?.source === source) {
      this.store().set({ drillTranslation: null });
      return;
    }
    this.store().set({ drillTranslation: { source, text: null } });
    try {
      const res = await api.post(`/v1/sessions/${sessionId}/translate`, { text: source });
      const text = (res.data as { text?: string }).text?.trim();
      if (this.store().drillTranslation?.source !== source) return; // bu arada başka metne geçildi
      this.store().set({ drillTranslation: text ? { source, text } : null });
      if (!text) LessonSync.notify(tr.drill.translateFailed);
    } catch {
      if (this.store().drillTranslation?.source === source) this.store().set({ drillTranslation: null });
      LessonSync.notify(tr.drill.translateFailed);
    }
  }

  // --- konuşma kartı mikrofonu ------------------------------------------------

  static async pressSpeak(): Promise<void> {
    const { busy, stopped, drillVerdict } = this.store();
    if (busy || stopped || drillVerdict) return;
    this.stopAudio();
    // Bayrak basış anında (iyimser) — kısa basışta bırakış kaydı kaçırmasın
    this.store().set({ recording: true });
    const ok = await VoiceService.startRecording();
    if (!ok) {
      this.store().set({ recording: false });
      LessonSync.notify(tr.notice.sttFailed);
    }
  }

  static async releaseSpeak(): Promise<void> {
    const { sessionId, recording } = this.store();
    this.store().set({ recording: false });
    if (!sessionId || !recording) return;
    this.store().set({ busy: true });
    try {
      const result = await VoiceService.stopRecording(sessionId);
      if (this.store().stopped) return;
      if (result.kind === "text") this.submitSpeech(result.text);
      else LessonSync.notify(result.kind === "failed" ? tr.notice.sttFailed : tr.notice.didntHear);
    } finally {
      this.store().set({ busy: false });
    }
  }
}

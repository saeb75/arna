import {
  answerReviewSchema,
  mistakesResponseSchema,
  savedWordSchema,
  savedWordsResponseSchema,
  triageAnswer,
  wordKey,
  wordLookupResponseSchema,
} from "@glotmate/contracts";
import { api, errorCode } from "../api";
import { tr } from "../i18n/tr";
import { VoiceService } from "../lib/voice";
import { HapticsService } from "../services/HapticsService";
import { useNotebookStore, type MistakeFilter, type ReviewEntry } from "../stores/useNotebookStore";
import { ToastController } from "./ToastController";

const PAGE = 20;

/**
 * DEFTER — cevap incelemesi (balon rozeti + sheet), kelime anlamı/kaydı ve Defter
 * sekmesinin listeleri.
 *
 * İNCELEME AKIŞA DOKUNMAZ: ders/rol yapma makinesi bu sonucu görmez, hak yanmaz,
 * sıra değişmez. Arka planda yürür; düşerse rozet sessizce kalkmaz, dokununca yeniden
 * denenir. Sunucu aynı sözü oturum başına BİR KEZ inceler (kalıcı kayıt) — sheet'i
 * tekrar açmak yeni çağrı değildir.
 */
export class NotebookController {
  private static store() {
    return useNotebookStore.getState();
  }

  private static patchReview(messageId: string, patch: Partial<ReviewEntry>): void {
    const { reviews } = this.store();
    const cur = reviews[messageId];
    if (!cur) return; // oturum değişti — geç gelen cevap yazılmaz
    this.store().set({ reviews: { ...reviews, [messageId]: { ...cur, ...patch } } });
  }

  // --- cevap incelemesi -------------------------------------------------------

  /**
   * Öğrencinin serbest sözünü arka planda incelet. Ön eleme (contracts
   * `triageAnswer`): "yes", "ok", tek harf → rozet yok, ağa çıkılmaz.
   */
  static review(sessionId: string, messageId: string, text: string, context?: string): void {
    if (triageAnswer(text)) return;
    const entry: ReviewEntry = { sessionId, text, context: context?.slice(0, 900) || undefined, status: "pending", review: null };
    this.store().set({ reviews: { ...this.store().reviews, [messageId]: entry } });
    void this.fetchReview(messageId);
  }

  private static async fetchReview(messageId: string): Promise<void> {
    const entry = this.store().reviews[messageId];
    if (!entry) return;
    this.patchReview(messageId, { status: "pending" });
    try {
      const res = await api.post(`/v1/sessions/${entry.sessionId}/review`, { text: entry.text, context: entry.context });
      this.patchReview(messageId, { status: "ready", review: answerReviewSchema.parse(res.data) });
    } catch {
      this.patchReview(messageId, { status: "failed" });
    }
  }

  /** Rozete dokunuldu: sheet açılır; inceleme düşmüşse yeniden denenir */
  static openReview(messageId: string): void {
    const entry = this.store().reviews[messageId];
    if (!entry) return;
    HapticsService.tap();
    this.store().set({ openReviewId: messageId, word: null });
    if (entry.status === "failed") void this.fetchReview(messageId);
  }

  static closeReview(): void {
    this.store().set({ openReviewId: null });
  }

  /**
   * "Bunu ben söylemedim" — ses yanlış anlaşıldıysa öğrenci söylemediği hatayla
   * anılmasın: kayıt Hatalarım'dan düşer, balondaki rozet kalkar.
   */
  static async notMine(messageId: string): Promise<void> {
    const { reviews, mistakes } = this.store();
    const id = reviews[messageId]?.review?.id;
    const rest = { ...reviews };
    delete rest[messageId];
    this.store().set({ reviews: rest, openReviewId: null, ...(id ? { mistakes: mistakes.filter((m) => m.id !== id) } : {}) });
    if (!id) return;
    try {
      await api.delete(`/v1/me/mistakes/${id}`);
    } catch {
      // Sunucuda kaldı — liste bir sonraki açılışta yeniden gösterir; oradan silinebilir
    }
  }

  /** Oturum ekranından çıkıldı: rozetler ve açık kartlar düşer (kayıtlar sunucuda) */
  static resetSession(): void {
    this.store().set({ reviews: {}, openReviewId: null, word: null });
  }

  // --- kelime ------------------------------------------------------------------

  /** İngilizce kelimeye dokunuldu: anlamı alttaki kartta. Aynı kelimeye tekrar dokunmak kapatır. */
  static async lookup(raw: string, context?: string): Promise<void> {
    const word = wordKey(raw);
    if (!word) return;
    if (this.store().word?.word === word) return this.closeWord();
    HapticsService.tap();
    // Bağlam yalnız GERÇEK bir cümleyse yollanır (≥3 kelime): tek kelimelik kalıp adı cümle değildir
    const trimmed = context?.trim().slice(0, 300) ?? "";
    const sentence = trimmed.split(/\s+/).length >= 3 ? trimmed : null;
    this.store().set({ word: { word, sentence, translation: null, sentenceTranslation: null, saved: false, failed: false } });
    try {
      const res = await api.post("/v1/words/lookup", { word, ...(sentence ? { sentence } : {}) });
      const parsed = wordLookupResponseSchema.parse(res.data);
      const cur = this.store().word;
      if (cur?.word !== word) return; // bu arada başka kelimeye geçildi
      this.store().set({
        word: { ...cur, translation: parsed.translation, sentenceTranslation: parsed.sentenceTranslation ?? null, saved: parsed.saved },
      });
    } catch {
      const cur = this.store().word;
      if (cur?.word === word) this.store().set({ word: { ...cur, failed: true } });
    }
  }

  static closeWord(): void {
    if (this.store().word) this.store().set({ word: null });
  }

  /** Karttaki yer imi: kaydet / kayıttan çıkar (iyimser; düşerse geri alınır) */
  static async toggleSaveWord(): Promise<void> {
    const cur = this.store().word;
    if (!cur || !cur.translation) return;
    const saved = !cur.saved;
    HapticsService.tap();
    this.store().set({ word: { ...cur, saved } });
    try {
      if (saved) {
        const res = await api.post("/v1/me/words", { word: cur.word, sentence: cur.sentence ?? undefined });
        const row = savedWordSchema.parse(res.data);
        const { words } = this.store();
        this.store().set({ words: [row, ...words.filter((w) => w.word !== row.word)] });
      } else {
        await api.delete(`/v1/me/words/${encodeURIComponent(cur.word)}`);
        this.store().set({ words: this.store().words.filter((w) => w.word !== cur.word) });
      }
    } catch (err) {
      const now = this.store().word;
      if (now?.word === cur.word) this.store().set({ word: { ...now, saved: !saved } });
      ToastController.error(errorCode(err) === "word_limit" ? tr.notebook.wordLimit : tr.errors.generic);
    }
  }

  // --- Defter sekmesi ------------------------------------------------------------

  static async loadMistakes(): Promise<void> {
    const { mistakeFilter } = this.store();
    this.store().set({ mistakesLoading: true, mistakesError: null });
    try {
      const res = await api.get("/v1/me/mistakes", {
        params: { limit: PAGE, ...(mistakeFilter !== "all" ? { kind: mistakeFilter } : {}) },
      });
      const parsed = mistakesResponseSchema.parse(res.data);
      if (this.store().mistakeFilter !== mistakeFilter) return; // filtre bu arada değişti
      this.store().set({ mistakes: parsed.items, mistakesNext: parsed.next, mistakeCounts: parsed.counts, mistakesLoaded: true });
    } catch (err) {
      this.store().set({ mistakesError: errorCode(err) });
    } finally {
      this.store().set({ mistakesLoading: false });
    }
  }

  /** Listenin sonuna gelindi — sonraki sayfa */
  static async loadMoreMistakes(): Promise<void> {
    const { mistakesNext, mistakesLoading, mistakeFilter, mistakes } = this.store();
    if (!mistakesNext || mistakesLoading) return;
    this.store().set({ mistakesLoading: true });
    try {
      const res = await api.get("/v1/me/mistakes", {
        params: { limit: PAGE, before: mistakesNext, ...(mistakeFilter !== "all" ? { kind: mistakeFilter } : {}) },
      });
      const parsed = mistakesResponseSchema.parse(res.data);
      if (this.store().mistakeFilter !== mistakeFilter) return;
      const seen = new Set(mistakes.map((m) => m.id));
      this.store().set({
        mistakes: [...mistakes, ...parsed.items.filter((m) => !seen.has(m.id))],
        mistakesNext: parsed.next,
        mistakeCounts: parsed.counts,
      });
    } catch {
      // Sayfa gelmedi — liste olduğu gibi kalır, sona tekrar gelince yeniden denenir
    } finally {
      this.store().set({ mistakesLoading: false });
    }
  }

  static setFilter(filter: MistakeFilter): void {
    if (this.store().mistakeFilter === filter) return;
    this.store().set({ mistakeFilter: filter, mistakes: [], mistakesNext: null, mistakesLoaded: false });
    void this.loadMistakes();
  }

  /** Listeden "bunu ben söylemedim" — iyimser; düşerse liste yeniden yüklenir */
  static async dismissMistake(id: string): Promise<void> {
    const { mistakes, mistakeCounts } = this.store();
    const item = mistakes.find((m) => m.id === id);
    if (!item) return;
    HapticsService.tap();
    this.store().set({
      mistakes: mistakes.filter((m) => m.id !== id),
      mistakeCounts: { ...mistakeCounts, [item.kind]: Math.max(0, mistakeCounts[item.kind] - 1) },
    });
    try {
      await api.delete(`/v1/me/mistakes/${id}`);
    } catch {
      ToastController.error(tr.errors.generic);
      void this.loadMistakes();
    }
  }

  static async loadWords(): Promise<void> {
    this.store().set({ wordsLoading: true, wordsError: null });
    try {
      const res = await api.get("/v1/me/words");
      this.store().set({ words: savedWordsResponseSchema.parse(res.data).items, wordsLoaded: true });
    } catch (err) {
      this.store().set({ wordsError: errorCode(err) });
    } finally {
      this.store().set({ wordsLoading: false });
    }
  }

  static async removeWord(word: string): Promise<void> {
    const before = this.store().words;
    HapticsService.tap();
    this.store().set({ words: before.filter((w) => w.word !== word) });
    try {
      await api.delete(`/v1/me/words/${encodeURIComponent(word)}`);
    } catch {
      this.store().set({ words: before });
      ToastController.error(tr.errors.generic);
    }
  }

  /** Defter'de İngilizce metni dinle (oturumsuz `/v1/tts`, yalnız İngilizce) — aynı metne tekrar dokunmak susturur */
  static async speak(text: string): Promise<void> {
    if (this.store().speakingText === text) return this.stopAudio();
    // init() DEĞİL: o mikrofon izni ister — Defter yalnız dinletir
    await VoiceService.playbackReady();
    this.store().set({ speakingText: text });
    const done = () => {
      if (this.store().speakingText === text) this.store().set({ speakingText: null });
    };
    void VoiceService.speak(null, [{ lang: "en", text: text.slice(0, 300) }], done, () => ToastController.error(tr.notice.audioFailed));
  }

  static stopAudio(): void {
    VoiceService.stopPlayback();
    this.store().set({ speakingText: null });
  }
}

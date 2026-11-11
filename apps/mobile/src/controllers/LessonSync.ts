import type { RichText, SessionPosition } from "@glotmate/contracts";
import { api } from "../api";
import { useLessonSessionStore } from "../stores/useLessonSessionStore";

/**
 * DERS SENKRONU — iki ders controller'ının (sohbet akışı + oyun bloğu) ortak G/Ç'si:
 * transkript satırları, pozisyon imleci ve kısa sistem uyarısı. Ayrı sınıf, çünkü
 * ikisi de kullanıyor ve controller'lar birbirini çağırınca döngüsel import doğuyordu.
 * Hepsi fire-and-forget — ders ASLA bloke olmaz.
 */

/** Sistem uyarısı (NoticeBar) ekranda bu kadar kalır; yeni girdi onu hemen siler */
const NOTICE_MS = 7_000;
let noticeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Devam yeniden-girişinde aktif beat yeniden sorulur; satır İLK oynatımda zaten
 * transkripte log'landığı için yeniden-soruş LOG'LANMAZ (çift kayıt olmasın).
 */
let suppressTurnLog = false;

export type LogTurn = { role: "user" | "assistant"; text: string; runs?: RichText; source?: "script" | "drill" };

export class LessonSync {
  private static store() {
    return useLessonSessionStore.getState();
  }

  /**
   * Kısa sistem uyarısı (NoticeBar). Eskiden STT/sohbet/ses hataları SESSİZDİ:
   * öğrenci konuşuyor, hiçbir şey olmuyordu — "hoca cevap vermiyor" şikâyetinin bir kökü.
   */
  static notify(text: string): void {
    this.store().set({ notice: text });
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => this.store().set({ notice: null }), NOTICE_MS);
  }

  static clearNotice(): void {
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = null;
    if (this.store().notice) this.store().set({ notice: null });
  }

  /** `fn` çalışırken yazılan transkript satırları sunucuya GİTMEZ (yeniden-soruş) */
  static withoutLogging(fn: () => void): void {
    suppressTurnLog = true;
    try {
      fn();
    } finally {
      suppressTurnLog = false;
    }
  }

  /**
   * Sunucuya ULAŞMAYAN transkript satırlarını logla: script replikleri + istemcide
   * çözülen öğrenci girdileri (oyun bloğu cevapları `source: "drill"`). Sunucu
   * chat/judge çiftlerini zaten yazıyor — onlar burada ASLA loglanmaz (çift kayıt olur).
   *
   * Bir söz + cevabı TEK istekte gider: iki ayrı fire-and-forget isteği yarışıyor,
   * transkriptte "Tam isabet!" öğrencinin cevabından ÖNCE görünüyordu.
   */
  static logTurns(turns: LogTurn[]): void {
    if (suppressTurnLog) return;
    const { sessionId, phase } = this.store();
    if (!sessionId || phase === "done") return;
    const rows = turns
      .filter((t) => t.text.trim())
      .map((t) => ({ role: t.role, text: t.text.slice(0, 2000), runs: t.runs, phase, ...(t.source ? { source: t.source } : {}) }));
    if (!rows.length) return;
    void api.post(`/v1/sessions/${sessionId}/sync`, { turns: rows }).catch(() => undefined);
  }

  static logTurn(role: "user" | "assistant", text: string, runs?: RichText): void {
    this.logTurns([{ role, text, runs }]);
  }

  /**
   * Pozisyon imleci. `awaiting` çağırandan gelir (store'daki değer konuşma
   * bitene dek null kalır — imleç beklenen HEDEFİ yazmalı). Kaybolan sync
   * devam noktasını en fazla bir-iki adım geri alır, asla ileri almaz.
   */
  static syncPosition(awaiting: SessionPosition["awaiting"]): void {
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
      // Oyun bloğunun içindeysek kuyruk durumu — devam aynı maddeden sürer
      ...(s.drill ? { drill: s.drill } : {}),
    };
    void api.post(`/v1/sessions/${s.sessionId}/sync`, { position }).catch(() => undefined);
  }
}

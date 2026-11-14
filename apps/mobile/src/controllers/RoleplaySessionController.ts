import {
  chatResponseSchema,
  endSessionResponseSchema,
  hasWordContent,
  roleplaySessionOpenSchema,
  type RichText,
} from "@glotmate/contracts";
import { Alert } from "react-native";
import { router } from "expo-router";
import { api, errorCode } from "../api";
import { tutorOfAvatarResponse } from "../domain/tutors";
import { tr } from "../i18n/tr";
import { useMeStore } from "../stores/useMeStore";
import { VoiceService } from "../lib/voice";
import { HapticsService } from "../services/HapticsService";
import { useRoleplaySessionStore } from "../stores/useRoleplaySessionStore";
import { MeController } from "./MeController";
import { NotebookController } from "./NotebookController";
import { RoleplayController } from "./RoleplayController";

/**
 * ROL YAPMA OTURUMU — ders makinesinin sade kardeşi.
 *
 * Kök kurallar (roleplay sözleşmesi + mobil CLAUDE.md):
 *  · Rol yapma HER ZAMAN İngilizce; persona yalnız öğrencinin sözüne cevap verir.
 *  · Sohbeti bitiren YALNIZ "Bitir" butonu — hiçbir sayaç/hedef kapatmaz (md. 6).
 *  · Hedef tikleri SUNUCUDAN gelir (`newHits`, kanıtı öğrencinin sözünde birebir
 *    doğrulanmış); istemci yalnız gösterir, karar vermez.
 *  · SÖZ KESME: persona konuşurken mikrofona basmak/göndermek sesi anında keser
 *    (`skipSpeaking` bekleyen onEnd'i zorla çalıştırır → `awaiting` açılır).
 *    Ders makinesindeki ileri sarma burada gereksiz: persona cevabından sonra
 *    akışta başka satır yok, bekleme noktası hemen gelir.
 *  · Girdi kilidi TEK ifade: `busy || grace` (dersle aynı); basılı mikrofon asla
 *    `disabled` olmaz.
 */

const GRACE_MS = 500;
let graceTimer: ReturnType<typeof setTimeout> | null = null;
/** Sistem uyarısı (NoticeBar) ekranda bu kadar kalır; yeni girdi onu hemen siler */
const NOTICE_MS = 7_000;
let noticeTimer: ReturnType<typeof setTimeout> | null = null;
let seq = 0;
const nextId = () => `r${++seq}`;
const runsText = (runs: RichText) => runs.map((r) => r.text).join(" ");

export class RoleplaySessionController {
  private static store() {
    return useRoleplaySessionStore.getState();
  }

  /**
   * Kısa sistem uyarısı — STT/sohbet/ses aksadığında. Eskiden bu anlar sessizdi
   * (söz ekranda kalıyor, persona susuyordu, öğrenci nedenini bilmiyordu).
   */
  private static notify(text: string): void {
    this.store().set({ notice: text });
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => this.store().set({ notice: null }), NOTICE_MS);
  }

  private static clearNotice(): void {
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = null;
    if (this.store().notice) this.store().set({ notice: null });
  }

  private static pushPersona(runs: RichText): void {
    this.store().push({ id: nextId(), role: "teacher", text: runsText(runs), runs });
    this.store().set({ grace: true });
    if (graceTimer) clearTimeout(graceTimer);
    graceTimer = setTimeout(() => this.store().set({ grace: false }), GRACE_MS);
  }

  private static speak(runs: RichText): void {
    const { session, stopped } = this.store();
    if (stopped || !session) return;
    this.store().set({ speaking: true, awaiting: false });
    void VoiceService.speak(
      session.sessionId,
      runs,
      () => {
        if (this.store().stopped) return;
        this.store().set({ speaking: false, awaiting: true });
      },
      () => this.notify(tr.notice.audioFailed),
    );
  }

  /** Oyun ekranı açılışı: aktif avatar + ses hazırlığı (oturum burada AÇILMAZ — "Başla"da açıldı) */
  static async prepare(slug: string): Promise<void> {
    const s = this.store();
    if (s.slug === slug && s.session) return; // brief'ten zaten açılıp gelindi
    s.reset();
    s.set({ slug });
  }

  /**
   * "Başla" (brief ekranı): oturumu aç, oyun ekranına geç, açılışı seslendir.
   * `inPlace`: oyun ekranı ZATEN açık ("Tekrar oyna") — gezinme yok, aynı ekranda
   * yeni oturum. Açılamazsa hata store'a yazılır; brief ekranı gösterir.
   */
  static async start(slug: string, inPlace = false): Promise<void> {
    if (this.store().busy) return; // çift dokunuş ikinci oturum açmasın
    const store = this.store();
    store.reset();
    NotebookController.resetSession(); // önceki sahnenin rozetleri bu sahneye taşınmasın
    store.set({ slug, phase: "opening", busy: true });
    await VoiceService.init();
    try {
      const [open, avatar] = await Promise.all([
        api.post(`/v1/roleplays/${slug}/sessions`),
        api.get("/v1/avatar").catch(() => null),
      ]);
      const session = roleplaySessionOpenSchema.parse(open.data);
      const { avatarId, tutorName } = tutorOfAvatarResponse(avatar?.data, useMeStore.getState().me?.tutor);
      this.store().set({
        session,
        avatarId,
        tutorName,
        phase: "playing",
        done: Object.fromEntries(session.objectives.map((o) => [o.id, false])),
      });
      if (!inPlace) router.push(`/roleplay/${slug}/play`);
      const opening: RichText = [{ lang: "en", text: session.opening }];
      this.pushPersona(opening);
      this.speak(opening);
    } catch (err) {
      // GÖRÜNÜR HATA: eskiden "Başla" sessizce eski hâline dönüyordu
      this.store().set({ phase: "idle", error: errorCode(err) });
    } finally {
      this.store().set({ busy: false });
    }
  }

  /** Öğrencinin sözü (yazı ya da STT) — persona cevabı + yeni tikler */
  static async say(text: string): Promise<void> {
    const t = text.trim();
    const { session, busy, stopped, phase } = this.store();
    // Yalnız noktalama boş girdidir — sunucu da reddeder (bkz. hasWordContent)
    if (!hasWordContent(t) || !session || busy || stopped || phase !== "playing") return;
    this.clearNotice();
    if (this.store().speaking) VoiceService.skipSpeaking(); // söz kesme
    // İnceleme bağlamı: karakterin az önce söylediği (parça cevap hata sayılmasın)
    const said = this.store().messages.filter((m) => m.role === "teacher").at(-1)?.text;
    const messageId = nextId();
    this.store().push({ id: messageId, role: "user", text: t });
    this.store().set({ busy: true, awaiting: false });
    // Arka planda incelenir: balonun yanına rozet, hatalar Defter'e. Sohbete dokunmaz.
    NotebookController.review(session.sessionId, messageId, t, said);
    try {
      const res = await api.post(`/v1/sessions/${session.sessionId}/chat`, { text: t, phase: "practice" });
      const reply = chatResponseSchema.parse(res.data);
      if (this.store().stopped) return;
      const runs: RichText = reply.runs?.length ? reply.runs : [{ lang: "en", text: reply.text }];
      const hits = reply.newHits ?? [];
      if (hits.length) {
        const done = { ...this.store().done };
        for (const h of hits) done[h.objectiveId] = true;
        this.store().set({ done, lastHit: hits[hits.length - 1]!.objectiveId });
        HapticsService.success();
      }
      this.pushPersona(runs);
      this.speak(runs);
    } catch {
      // Aktarım hatası: söz ekranda kalır, öğrenci yeniden deneyebilir — akış kilitlenmez.
      // Artık SÖYLENİR: eskiden persona sebepsizce susuyordu.
      if (!this.store().stopped) this.notify(tr.notice.replyFailed);
      this.store().set({ awaiting: true });
    } finally {
      this.store().set({ busy: false });
    }
  }

  static async pressMic(): Promise<void> {
    const { busy, stopped, phase } = this.store();
    if (busy || stopped || phase !== "playing") return;
    this.clearNotice();
    if (this.store().speaking) VoiceService.skipSpeaking();
    // Bayrak BASIŞ ANINDA (ders dersi: kısa basışta await sonrası kurulan bayrak kaçıyordu)
    this.store().set({ recording: true });
    const ok = await VoiceService.startRecording();
    if (!ok) {
      this.store().set({ recording: false });
      this.notify(tr.notice.sttFailed);
    }
  }

  static async releaseMic(): Promise<void> {
    const { session, recording } = this.store();
    this.store().set({ recording: false });
    if (!session || !recording) return;
    const result = await VoiceService.stopRecording(session.sessionId);
    if (this.store().stopped) return;
    if (result.kind === "text") return void (await this.say(result.text));
    // Boş ya da başarısız kayıt hak yemez — ama artık sessiz değil
    this.notify(result.kind === "failed" ? tr.notice.sttFailed : tr.notice.didntHear);
  }

  /**
   * TEK BİTİRİCİ — "Bitir": oturumu kapat, debrief'i göster. Debrief'in hedef
   * özeti deterministik; koçluk düşerse boş gelir — buton asla bloke olmaz.
   */
  static async finish(): Promise<void> {
    const { session, phase } = this.store();
    if (!session || phase !== "playing") return;
    this.store().set({ phase: "ending", awaiting: false, stopped: true, speaking: false });
    VoiceService.stopAll();
    try {
      const res = await api.post(`/v1/sessions/${session.sessionId}/end`, { outcome: "completed" });
      const parsed = endSessionResponseSchema.parse(res.data);
      this.store().set({ phase: "debrief", debrief: parsed.debrief ?? null });
      if ((parsed.debrief?.progress.done ?? 0) > 0) HapticsService.success();
    } catch {
      // Debrief gelmedi — yine de sonuç ekranı (canlı listeden) gösterilir
      this.store().set({ phase: "debrief", debrief: null });
    }
    void RoleplayController.loadList(); // liste kartındaki "3/4" tazelensin
    void MeController.loadStats();
  }

  /** ✕ önce onay — çıkış denemeyi kaydetmez (sonuç için "Bitir") */
  static confirmExit(): void {
    Alert.alert(tr.roleplay.play.exitTitle, tr.roleplay.play.exitBody, [
      { text: tr.common.cancel, style: "cancel" },
      { text: tr.roleplay.play.exitConfirm, style: "destructive", onPress: () => this.exit() },
    ]);
  }

  static exit(): void {
    this.leave();
    router.back();
  }

  /** Ekrandan çıkış: ses sus, zincir dursun. Oturum açık kalır — bir sonraki "Başla" kapatır. */
  static leave(): void {
    this.store().set({ stopped: true, speaking: false, recording: false });
    VoiceService.stopAll();
  }

  /**
   * Debrief'ten "Tekrar oyna": aynı senaryo AYNI EKRANDA yeniden açılır.
   * Eskiden `router.back()` + `start()` idi: kapanan ekranın `leave()`'i yeni
   * oturumun store'una `stopped: true` yazıyor, yeni sahne ölü doğuyordu
   * (karakter açılışı okumuyor, söz gönderilemiyordu — 14 Kas 2026).
   */
  static async again(): Promise<void> {
    const slug = this.store().slug;
    if (!slug) return;
    await this.start(slug, true);
  }
}

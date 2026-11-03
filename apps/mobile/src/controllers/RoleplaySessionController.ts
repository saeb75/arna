import {
  chatResponseSchema,
  DEFAULT_AVATAR_ID,
  endSessionResponseSchema,
  hasWordContent,
  roleplaySessionOpenSchema,
  type RichText,
} from "@glotmate/contracts";
import { Alert } from "react-native";
import { router } from "expo-router";
import { api, errorCode, quotaKindOf } from "../api";
import { tr } from "../i18n/tr";
import { VoiceService } from "../lib/voice";
import { HapticsService } from "../services/HapticsService";
import { useRoleplaySessionStore } from "../stores/useRoleplaySessionStore";
import { MeController } from "./MeController";
import { PaywallController } from "./PaywallController";
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
let seq = 0;
const nextId = () => `r${++seq}`;
const runsText = (runs: RichText) => runs.map((r) => r.text).join(" ");

export class RoleplaySessionController {
  private static store() {
    return useRoleplaySessionStore.getState();
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
    void VoiceService.speak(session.sessionId, runs, () => {
      if (this.store().stopped) return;
      this.store().set({ speaking: false, awaiting: true });
    });
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
   * 402 → bugünkü ücretsiz hak bitti: paywall.
   */
  static async start(slug: string): Promise<void> {
    const store = this.store();
    store.reset();
    store.set({ slug, phase: "opening", busy: true });
    await VoiceService.init();
    try {
      const [open, avatar] = await Promise.all([
        api.post(`/v1/roleplays/${slug}/sessions`),
        api.get("/v1/avatar").catch(() => null),
      ]);
      const session = roleplaySessionOpenSchema.parse(open.data);
      const avatarId = (avatar?.data as { activeId?: string } | undefined)?.activeId ?? DEFAULT_AVATAR_ID;
      this.store().set({
        session,
        avatarId,
        phase: "playing",
        done: Object.fromEntries(session.objectives.map((o) => [o.id, false])),
      });
      void MeController.load(); // kota göstergesi tazelensin
      router.push(`/roleplay/${slug}/play`);
      const opening: RichText = [{ lang: "en", text: session.opening }];
      this.pushPersona(opening);
      this.speak(opening);
    } catch (err) {
      this.store().set({ phase: "idle" });
      if (quotaKindOf(err)) {
        void MeController.load();
        PaywallController.open("quota_roleplay");
        return;
      }
      this.store().set({ error: errorCode(err) });
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
    if (this.store().speaking) VoiceService.skipSpeaking(); // söz kesme
    this.store().push({ id: nextId(), role: "user", text: t });
    this.store().set({ busy: true, awaiting: false });
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
      // Aktarım hatası: söz ekranda kalır, öğrenci yeniden deneyebilir — akış kilitlenmez
      this.store().set({ awaiting: true });
    } finally {
      this.store().set({ busy: false });
    }
  }

  static async pressMic(): Promise<void> {
    const { busy, stopped, phase } = this.store();
    if (busy || stopped || phase !== "playing") return;
    if (this.store().speaking) VoiceService.skipSpeaking();
    // Bayrak BASIŞ ANINDA (ders dersi: kısa basışta await sonrası kurulan bayrak kaçıyordu)
    this.store().set({ recording: true });
    const ok = await VoiceService.startRecording();
    if (!ok) this.store().set({ recording: false });
  }

  static async releaseMic(): Promise<void> {
    const { session, recording } = this.store();
    this.store().set({ recording: false });
    if (!session || !recording) return;
    const text = await VoiceService.stopRecording(session.sessionId);
    if (text) await this.say(text);
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

  /** Debrief'ten "Tekrar oyna": aynı senaryo bugün yeniden açılır (kota hak yakmaz) */
  static async again(): Promise<void> {
    const slug = this.store().slug;
    if (!slug) return;
    router.back();
    await this.start(slug);
  }
}

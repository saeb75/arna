import { tutorSampleResponseSchema, tutorsResponseSchema } from "@glotmate/contracts";
import { api, errorCode } from "../api";
import { pickableTutors } from "../domain/tutors";
import { VoiceService } from "../lib/voice";
import { useTutorsStore } from "../stores/useTutorsStore";
import { MeController } from "./MeController";
import { NotificationController } from "./NotificationController";

/**
 * ÖĞRETMEN SEÇİMİ — onboarding'deki "öğretmenini seç" adımı ve ayarlardaki sheet.
 * Liste GET /v1/tutors; kartın sesi POST /v1/tutors/:id/sample (öğretmenin kendi sesiyle
 * kısa İngilizce tanıtım). Seçim onboarding gövdesiyle ya da PATCH /v1/me/profile ile yazılır;
 * yüz/ses/ad dersler ve rol yapmada sunucudan çözülür (/v1/avatar, TTS) — istemci yalnız seçer.
 */
export class TutorController {
  private static store() {
    return useTutorsStore.getState();
  }

  /** GET /v1/tutors — yalnız bu derlemede portresi olanlar tutulur. Liste zaten varsa sessizce tazeler. */
  static async load(): Promise<void> {
    this.store().set({ error: null });
    try {
      const res = await api.get("/v1/tutors");
      const parsed = tutorsResponseSchema.parse(res.data);
      const tutors = pickableTutors(parsed.tutors);
      const defaultId = tutors.find((t) => t.id === parsed.defaultId)?.id ?? tutors[0]?.id ?? null;
      this.store().set({ tutors, defaultId });
    } catch (err) {
      this.store().set({ error: errorCode(err) });
    }
  }

  /**
   * Kartın sesi — öğretmen kendini tanıtır. Aynı karta yeniden dokunmak baştan çalar;
   * başka karta dokunmak öncekini susturur. Ses düşerse seçim yine geçerli (yalnız süs).
   */
  static async playSample(id: string): Promise<void> {
    VoiceService.stopPlayback();
    this.store().set({ sampling: id });
    try {
      const res = await api.post(`/v1/tutors/${id}/sample`);
      const { clips } = tutorSampleResponseSchema.parse(res.data);
      // Yolda başka karta dokunulduysa ya da ekrandan çıkıldıysa bu ses artık çalmaz
      if (this.store().sampling !== id) return;
      await VoiceService.playClips(clips, () => {
        if (this.store().sampling === id) this.store().set({ sampling: null });
      });
    } catch {
      if (this.store().sampling === id) this.store().set({ sampling: null });
    }
  }

  /** Ekrandan çıkış / adım değişimi — sesi sustur */
  static stopSample(): void {
    if (!this.store().sampling) return;
    this.store().set({ sampling: null });
    VoiceService.stopPlayback();
  }

  /**
   * Ayarlar: PATCH /v1/me/profile {tutorId} → /me tazelenir (sunucunun çözdüğü
   * `tutor` alanı ekranlardaki adı ve portreyi besler). Dönüş: kaydedildi mi.
   */
  static async save(tutorId: string): Promise<boolean> {
    if (!(await MeController.updateProfile({ tutorId }))) return false;
    await MeController.load();
    // Günlük hatırlatma metni öğretmenin adını taşır — yeni adla yeniden kur
    void NotificationController.resync();
    return true;
  }
}

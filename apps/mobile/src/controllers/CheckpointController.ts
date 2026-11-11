import { checkpointSchema } from "@glotmate/contracts";
import { api, errorCode } from "../api";
import { VoiceService } from "../lib/voice";
import { useCheckpointStore } from "../stores/useCheckpointStore";

/**
 * Ünite sonu testi. Test SAKLANMAZ: sunucu her istekte yayınlı çekirdeklerden
 * yeniden derler, bu yüzden "tekrar dene" gerçekten yeni sorular getirir.
 * Değerlendirme istemcide ve LLM'siz (`gradeCheckpointItem`, contracts) —
 * sunucuya yalnız SONUÇ yazılır.
 */
export class CheckpointController {
  /** GET /v1/checkpoints/:level/:unitIndex — doğrular, store'a yazar. */
  static async getCheckpoint(level: string, unitIndex: number): Promise<void> {
    const store = useCheckpointStore.getState();
    store.clear();
    store.setLoading(true);
    try {
      const res = await api.get(`/v1/checkpoints/${level}/${unitIndex}`);
      store.setCheckpoint(checkpointSchema.parse(res.data));
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }

  /**
   * Dinleme maddesinin cümlesini öğretmenin sesiyle çal. Test bir ders oturumu açmaz →
   * oturumsuz, yalnız İngilizce okuyan uç (`/v1/tts`). Ses düşerse madde yine
   * oynanabilir (seçenekler ekranda) — akış beklemez.
   */
  static play(text: string): void {
    const store = useCheckpointStore.getState();
    store.setSpeaking(true);
    void VoiceService.speak(null, [{ lang: "en", text }], () => useCheckpointStore.getState().setSpeaking(false));
  }

  /** Madde değişti ya da ekrandan çıkıldı — sesi sustur */
  static stopAudio(): void {
    VoiceService.stopPlayback();
    useCheckpointStore.getState().setSpeaking(false);
  }

  /**
   * POST /v1/checkpoints/:level/:unitIndex — sonucu kaydeder.
   * Kayıt DÜŞERSE test yine tamamlanmış sayılır: öğrenci 8 soruyu çözdü, ağ
   * hatası onun emeğini geri almaz. Hata yalnız `saveError` olarak bildirilir.
   */
  static async saveResult(
    level: string,
    unitIndex: number,
    result: { score: number; total: number; weakLessonIds: string[] },
  ): Promise<void> {
    const store = useCheckpointStore.getState();
    try {
      await api.post(`/v1/checkpoints/${level}/${unitIndex}`, result);
      store.setSaveError(null);
    } catch (err) {
      store.setSaveError(errorCode(err));
    }
  }
}

import * as Haptics from "expo-haptics";

/**
 * Dokunsal geri bildirim — anlamlı dokunuşlarda hafif darbe, başarıda bildirim.
 * Hiçbiri akışı bekletmez ve hata fırlatmaz (cihaz desteklemiyorsa sessiz).
 */
export class HapticsService {
  /** Bir seçim, sekme, ana eylem */
  static tap(): void {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }

  /** Bir seçim kaydı (pil, kaydırıcı) — darbeden daha hafif */
  static selection(): void {
    void Haptics.selectionAsync().catch(() => undefined);
  }

  /** Hedef tamamlandı, satın alma bitti, ders bitti */
  static success(): void {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }

  /** Yanlış cevap — azarlamadan, tek uyarı */
  static warning(): void {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  }
}

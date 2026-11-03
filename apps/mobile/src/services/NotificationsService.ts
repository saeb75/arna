import * as Notifications from "expo-notifications";

/**
 * Günlük YEREL hatırlatıcı — push sunucusu yok. İzin ve zamanlama burada;
 * metin ve saat çağırandan gelir (NotificationController). Hiçbir yöntem
 * fırlatmaz: izin reddi ya da modül eksikliği akışı bozmaz.
 */
const REMINDER_ID = "daily-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class NotificationsService {
  /** İzin var mı (sormadan) */
  static async granted(): Promise<boolean> {
    try {
      const s = await Notifications.getPermissionsAsync();
      return s.granted || s.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    } catch {
      return false;
    }
  }

  /** Sistemin izin sorusu — bir kez sorulabilir; sonrası Ayarlar'dan */
  static async request(): Promise<boolean> {
    try {
      if (await this.granted()) return true;
      const s = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });
      return s.granted;
    } catch {
      return false;
    }
  }

  /** Her gün aynı saatte — önceki hatırlatıcı değiştirilir */
  static async scheduleDaily(time: string, title: string, body: string): Promise<boolean> {
    const [hour, minute] = time.split(":").map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return false;
    try {
      await this.cancel();
      await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: { title, body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hour!, minute: minute! },
      });
      return true;
    } catch {
      return false;
    }
  }

  static async cancel(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
  }
}

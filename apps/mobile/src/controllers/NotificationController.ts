import { tr } from "../i18n/tr";
import { NotificationsService } from "../services/NotificationsService";
import { useSettingsStore } from "../stores/useSettingsStore";
import { ToastController } from "./ToastController";

/**
 * Günlük YEREL hatırlatıcı — izin, zamanlama ve tercih tek yerde. Metin
 * arayüz sözlüğünden; saat cihazın yerel saati.
 */
export class NotificationController {
  /** İzni ister, verilirse hatırlatıcıyı kurar. Dönüş: açıldı mı */
  static async enable(time?: string): Promise<boolean> {
    const settings = useSettingsStore.getState();
    const at = time ?? settings.reminderTime;
    const granted = await NotificationsService.request();
    if (!granted) {
      settings.set({ reminderOn: false });
      return false;
    }
    const ok = await NotificationsService.scheduleDaily(at, tr.reminder.title, tr.reminder.body);
    settings.set({ reminderOn: ok, reminderTime: at });
    return ok;
  }

  static async disable(): Promise<void> {
    await NotificationsService.cancel();
    useSettingsStore.getState().set({ reminderOn: false });
  }

  /** Ayarlardan aç/kapa — izin reddedildiyse kullanıcıya Ayarlar'ı söyler */
  static async toggle(on: boolean): Promise<void> {
    if (!on) return this.disable();
    const ok = await this.enable();
    if (!ok) ToastController.info(tr.settings.reminderDenied);
  }

  static async setTime(time: string): Promise<void> {
    const settings = useSettingsStore.getState();
    settings.set({ reminderTime: time });
    if (settings.reminderOn) await NotificationsService.scheduleDaily(time, tr.reminder.title, tr.reminder.body);
  }

  /** Açılışta: tercih açıksa ve izin hâlâ varsa zamanlamayı tazele (yeniden kurulumdan sonra kaybolmasın) */
  static async resync(): Promise<void> {
    const { reminderOn, reminderTime } = useSettingsStore.getState();
    if (!reminderOn) return;
    if (!(await NotificationsService.granted())) {
      useSettingsStore.getState().set({ reminderOn: false });
      return;
    }
    await NotificationsService.scheduleDaily(reminderTime, tr.reminder.title, tr.reminder.body);
  }
}

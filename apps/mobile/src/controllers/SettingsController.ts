import { HapticsService } from "../services/HapticsService";
import { useSettingsStore } from "../stores/useSettingsStore";
import type { SchemeSetting } from "../theme/scheme";

/** Cihaz tercihleri — görünüm. (Hatırlatıcı NotificationController'da: izin + zamanlama ister.) */
export class SettingsController {
  static setScheme(scheme: SchemeSetting): void {
    HapticsService.selection();
    useSettingsStore.getState().set({ scheme });
  }
}

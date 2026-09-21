import { AppState } from "react-native";
import * as Updates from "expo-updates";
import { useUpdatesStore } from "../stores/useUpdatesStore";

/**
 * OTA (EAS Update) akışı — stateless class, durum useUpdatesStore'da
 * (AuthController deseni). Ekranlar `expo-updates` import ETMEZ.
 *
 * Tasarım: açılış ASLA bloklanmaz. expo-updates varsayılanıyla (ON_LOAD +
 * fallbackToCacheTimeout 0) uygulama mevcut bundle'la açılır, yeni sürüm arka
 * planda iner; hazır olunca kullanıcıya kart çıkar ve yeniden başlatma
 * kararını O verir. Ders/test ortasında reload etmemek için kart yalnız
 * sekme kabuğunda render edilir (bkz. app/(tabs)/_layout.tsx).
 */

// Modül düzeyinde guard — React StrictMode/fast-refresh ikinci kez
// çağırdığında dinleyiciler çoğalmasın.
let started = false;

export class UpdatesController {
  /** Açılışta bir kez: bekleyen güncellemeyi dinle + öne gelişte kontrol et. */
  static start(): void {
    // Dev client ve Expo Go'da updates kapalıdır; çağrılar orada hata fırlatır.
    if (!Updates.isEnabled || started) return;
    started = true;

    // Otomatik (ON_LOAD) indirmeyi de, aşağıdaki elle fetch'i de tek yerden yakalar.
    Updates.addUpdatesStateChangeListener((event) => {
      useUpdatesStore.getState().setPending(event.context.isUpdatePending);
    });

    // Uzun süre açık kalan uygulama açılıştaki tek kontrolle yetinmesin.
    AppState.addEventListener("change", (status) => {
      if (status === "active") void UpdatesController.check();
    });

    void UpdatesController.check();
  }

  /**
   * Güncelleme var mı bak, varsa indir. Hata SESSİZCE yutulur: güncelleme
   * kontrolü (ağ yok, EAS erişilemiyor, vb.) uygulamayı asla bozmamalı.
   */
  private static async check(): Promise<void> {
    if (!Updates.isEnabled) return;
    try {
      const { isAvailable } = await Updates.checkForUpdateAsync();
      if (isAvailable) await Updates.fetchUpdateAsync();
    } catch {
      // yoksay — bir sonraki öne gelişte tekrar denenir
    }
  }

  /** İnen güncellemeyi uygula: süreç yeniden başlar. */
  static async apply(): Promise<void> {
    const store = useUpdatesStore.getState();
    store.setApplying(true);
    try {
      await Updates.reloadAsync();
    } catch {
      // reload olmadıysa kart geri gelsin, kullanıcı tekrar deneyebilsin
      store.setApplying(false);
    }
  }
}

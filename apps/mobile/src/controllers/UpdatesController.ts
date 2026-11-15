import { AppState } from "react-native";
import * as Updates from "expo-updates";
import { useUpdatesStore } from "../stores/useUpdatesStore";

/**
 * OTA (EAS Update) akışı — stateless class, durum useUpdatesStore'da
 * (AuthController deseni). Ekranlar `expo-updates` import ETMEZ.
 *
 * AÇILIŞTA OTOMATİK (14 Kas 2026, kullanıcı kararı): uygulama açılırken — native
 * splash hâlâ ekrandayken — güncelleme var mı bakılır, varsa indirilip HEMEN
 * uygulanır (`applyOnLaunch`). Eskiden yeni sürüm arka planda iniyor, ancak
 * uygulama ikinci kez açılınca görünüyordu. Açılış süre sınırlıdır: ağ yavaşsa
 * mevcut bundle'la açılır, güncelleme arka planda inmeye devam eder.
 *
 * Uygulama AÇIKKEN inen güncelleme için kart çıkar ve yeniden başlatma kararını
 * kullanıcı verir. Ders/test ortasında reload etmemek için kart yalnız sekme
 * kabuğunda render edilir (bkz. app/(tabs)/_layout.tsx).
 */

/** Açılışta "güncelleme var mı" sorusuna ayrılan süre */
const LAUNCH_CHECK_MS = 2500;
/** Güncelleme varsa indirmeye ayrılan süre (aşılırsa arka planda sürer, kart çıkar) */
const LAUNCH_FETCH_MS = 8000;

function within<T>(work: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([work, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

// Modül düzeyinde guard — React StrictMode/fast-refresh ikinci kez
// çağırdığında dinleyiciler çoğalmasın.
let started = false;

export class UpdatesController {
  /**
   * Açılış kapısından ÖNCE (splash ekrandayken): güncelleme varsa indir ve uygula.
   * Dönerse uygulama mevcut bundle'la açılmaya devam eder (güncelleme yok, süre
   * doldu ya da hata). Geri alma sonrası açılışta (`isEmergencyLaunch`) denenmez —
   * bozuk güncelleme yeniden başlatma döngüsüne sokmasın.
   */
  static async applyOnLaunch(): Promise<void> {
    if (!Updates.isEnabled || Updates.isEmergencyLaunch) return;
    try {
      const check = await within(Updates.checkForUpdateAsync(), LAUNCH_CHECK_MS);
      if (!check?.isAvailable) return;
      const fetched = await within(Updates.fetchUpdateAsync(), LAUNCH_FETCH_MS);
      if (fetched?.isNew) await Updates.reloadAsync();
    } catch {
      // yoksay — uygulama mevcut bundle'la açılır
    }
  }

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

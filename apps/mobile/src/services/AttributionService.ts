import { Platform } from "react-native";

type AppsFlyer = typeof import("react-native-appsflyer").default;

let started = false;
let sdk: AppsFlyer | null | undefined;

/**
 * Native modül bu derlemede yoksa (paket eklenmeden önce alınmış build'e OTA ile gelen kod)
 * `react-native-appsflyer` YÜKLENİRKEN fırlatır — bu yüzden import tembel ve korumalıdır.
 */
function load(): AppsFlyer | null {
  if (sdk !== undefined) return sdk;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sdk = (require("react-native-appsflyer") as { default: AppsFlyer }).default ?? null;
  } catch {
    sdk = null;
  }
  return sdk;
}

/** EAS env + .env.local (ikisi birlikte güncellenir). Anahtar yoksa ölçüm kapalıdır. */
const DEV_KEY = process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY || undefined;
/** App Store'daki sayısal uygulama kimliği (yalnız iOS ister) */
const APP_ID = process.env.EXPO_PUBLIC_APPSFLYER_APP_ID || undefined;

/**
 * AppsFlyer: kurulum ölçümü (hangi reklam/kanal getirdi) + uygulama içi olaylar.
 * Uygulamanın ekranlarını bilmez; AttributionController kullanır. Asla fırlatmaz.
 * (GlotCast'teki servisin aynısı — OneLink derin bağlantıları burada yok.)
 */
export class AttributionService {
  static get available(): boolean {
    return started;
  }

  /**
   * Açılışta bir kez. iOS'ta ilk açılış olayı izleme sorusu cevaplanana kadar (en çok 60 sn)
   * bekletilir; müşteri kimliği SDK başlamadan ÖNCE verilir ki kurulum onu taşısın.
   */
  static start(customerUserId: string | null): void {
    // Geliştirme derlemesi kurulum/olay bildirmez (gerçek panoya düşerdi)
    if (started || Platform.OS === "web" || (__DEV__ && process.env.EXPO_PUBLIC_ATTRIBUTION_IN_DEV !== "1")) return;
    if (!DEV_KEY || (Platform.OS === "ios" && !APP_ID)) return;
    const appsFlyer = load();
    if (!appsFlyer) return;
    try {
      appsFlyer.initSdk(
        {
          devKey: DEV_KEY,
          appId: Platform.OS === "ios" ? APP_ID : undefined,
          isDebug: __DEV__,
          onInstallConversionDataListener: false,
          onDeepLinkListener: false,
          timeToWaitForATTUserAuthorization: 60,
          manualStart: true,
        },
        () => undefined,
        (err) => {
          if (__DEV__) console.warn("[appsflyer] initSdk failed", err);
        },
      );
      if (customerUserId) appsFlyer.setCustomerUserId(customerUserId);
      appsFlyer.startSdk();
      started = true;
    } catch (err) {
      if (__DEV__) console.warn("[appsflyer] start failed", err);
    }
  }

  static setCustomerUserId(id: string | null): void {
    const appsFlyer = load();
    if (!started || !appsFlyer) return;
    try {
      appsFlyer.setCustomerUserId(id ?? "");
    } catch {
      // yoksay
    }
  }

  /** AppsFlyer'ın kurulum kimliği (RevenueCat satın almaları AppsFlyer'a bununla yollar) */
  static uid(): Promise<string | null> {
    const appsFlyer = load();
    if (!started || !appsFlyer) return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        appsFlyer.getAppsFlyerUID((err, uid) => resolve(err || !uid ? null : uid));
      } catch {
        resolve(null);
      }
    });
  }

  static async log(event: string, values: Record<string, string | number | boolean> = {}): Promise<void> {
    const appsFlyer = load();
    if (!started || !appsFlyer) return;
    try {
      await appsFlyer.logEvent(event, values);
    } catch (err) {
      if (__DEV__) console.warn(`[appsflyer] ${event} failed`, err);
    }
  }
}

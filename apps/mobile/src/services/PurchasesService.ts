import { Platform } from "react-native";
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";

let configured = false;

/** Platformun genel (public) SDK anahtarı — EAS env + .env.local (ikisi birlikte güncellenir) */
const API_KEY =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

/**
 * Mağaza abonelikleri — RevenueCat üzerinden. Uygulamanın durumunu bilmez;
 * PaywallController/ProController kullanır. Anahtar yoksa ya da bu build'de
 * modül yoksa (eski build'e ulaşan JS güncellemesi) `configure` false döner:
 * paywall önizleme planlarıyla görünür, hiçbir şey satın alınmaz, uygulama çökmez.
 */
export class PurchasesService {
  static get configured(): boolean {
    return configured;
  }

  /** Açılışta bir kez — müşteri kimliği Supabase kullanıcı kimliği (misafir dahil) */
  static configure(appUserId: string): boolean {
    if (configured) return true;
    if (!API_KEY) return false;
    try {
      Purchases.configure({ apiKey: API_KEY, appUserID: appUserId });
    } catch {
      return false;
    }
    if (__DEV__) void Purchases.setLogLevel(LOG_LEVEL.WARN).catch(() => undefined);
    configured = true;
    return true;
  }

  /** Başka bir hesaba geçildi (mevcut hesapla giriş) — satın almalar o kimliğe bağlanır */
  static async logIn(appUserId: string): Promise<CustomerInfo | null> {
    if (!configured) return null;
    return (await Purchases.logIn(appUserId)).customerInfo;
  }

  static async logOut(): Promise<void> {
    if (!configured) return;
    if (await Purchases.isAnonymous()) return;
    await Purchases.logOut();
  }

  static async customerInfo(): Promise<CustomerInfo | null> {
    if (!configured) return null;
    return await Purchases.getCustomerInfo();
  }

  /** Satın alma/geri yükleme/yenileme/bitiş — dönüş: aboneliği bırakan fonksiyon */
  static onCustomerInfo(listener: (info: CustomerInfo) => void): () => void {
    if (!configured) return () => undefined;
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => void Purchases.removeCustomerInfoUpdateListener(listener);
  }

  /** Geçerli offering'in paketleri (RevenueCat'te kurulu değilse boş) */
  static async currentPackages(): Promise<PurchasesPackage[]> {
    if (!configured) return [];
    return (await Purchases.getOfferings()).current?.availablePackages ?? [];
  }

  /** Bu Apple ID'nin hâlâ alabileceği ücretsiz denemeler */
  static async trialEligible(productIds: string[]): Promise<Set<string>> {
    if (!configured || !productIds.length) return new Set();
    const status = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);
    return new Set(
      productIds.filter((id) => status[id]?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE),
    );
  }

  /** Mağazanın satın alma sayfası — kullanıcı kapatırsa "cancelled"; diğer hatalar fırlar */
  static async purchase(pkg: PurchasesPackage): Promise<"purchased" | "cancelled"> {
    try {
      await Purchases.purchasePackage(pkg);
      return "purchased";
    } catch (error) {
      if ((error as { userCancelled?: boolean | null }).userCancelled) return "cancelled";
      throw error;
    }
  }

  static async restore(): Promise<CustomerInfo | null> {
    if (!configured) return null;
    return await Purchases.restorePurchases();
  }

  /** Mağazanın abonelik sayfası (plan değiştir, iptal) */
  static async manageSubscriptions(): Promise<void> {
    if (!configured) return;
    await Purchases.showManageSubscriptions();
  }
}

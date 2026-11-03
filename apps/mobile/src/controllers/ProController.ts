import { entitlementRefreshResponseSchema } from "@glotmate/contracts";
import type { CustomerInfo } from "react-native-purchases";
import { api } from "../api";
import { PurchasesService } from "../services/PurchasesService";
import { useMeStore } from "../stores/useMeStore";
import { useProStore } from "../stores/useProStore";

const ENTITLEMENT = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "pro";

/**
 * Pro durumu. Karar SUNUCUDA (kota orada zorlanıyor): `me.entitlement`.
 * RevenueCat'in gördüğü aktif abonelik yalnız iki iş görür: ekranı anında
 * açmak ve sunucuya "yeniden doğrula" demek — böylece satın almayla kota
 * kalkması arasında boşluk kalmaz.
 */
export class ProController {
  private static unsubscribe: (() => void) | null = null;

  /** Açılışta: RevenueCat'i bu kullanıcıyla kur, değişiklikleri dinle */
  static init(userId: string): void {
    const ok = PurchasesService.configure(userId);
    useProStore.getState().set({ preview: !ok });
    if (!ok || this.unsubscribe) return;
    this.unsubscribe = PurchasesService.onCustomerInfo((info) => this.apply(info));
    void PurchasesService.customerInfo()
      .then((info) => info && this.apply(info))
      .catch(() => undefined);
  }

  /** Başka hesaba geçildi — satın almalar o kimliğe bağlanır */
  static async identify(userId: string): Promise<void> {
    try {
      const info = await PurchasesService.logIn(userId);
      if (info) this.apply(info);
    } catch {
      // Bir sonraki açılış yeniden bağlar
    }
  }

  static async forget(): Promise<void> {
    useProStore.getState().set({ storeActive: false });
    await PurchasesService.logOut().catch(() => undefined);
  }

  private static apply(info: CustomerInfo): void {
    const active = info.entitlements.active[ENTITLEMENT] !== undefined || info.activeSubscriptions.length > 0;
    useProStore.getState().set({ storeActive: active });
    // Mağaza "aktif" diyor ama sunucu henüz bilmiyor → zorla doğrulat
    if (active && !useMeStore.getState().me?.entitlement.isPro) void this.refreshEntitlement();
  }

  /** POST /v1/me/entitlement/refresh — sunucu RevenueCat'e ZORLA bakar; kota aynı cevapla güncellenir */
  static async refreshEntitlement(): Promise<boolean> {
    try {
      const res = await api.post("/v1/me/entitlement/refresh");
      const { entitlement, quota } = entitlementRefreshResponseSchema.parse(res.data);
      useMeStore.getState().setEntitlement(entitlement, quota);
      return entitlement.isPro;
    } catch {
      return false;
    }
  }

  static async manageSubscriptions(): Promise<void> {
    await PurchasesService.manageSubscriptions();
  }
}

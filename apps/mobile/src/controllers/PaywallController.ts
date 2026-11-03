import { Alert } from "react-native";
import { router } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import { LEGAL } from "../config/legal";
import { PREVIEW_PACKAGES, toPlans, type StorePackage } from "../domain/pro";
import { tr } from "../i18n/tr";
import { BrowserService } from "../services/BrowserService";
import { HapticsService } from "../services/HapticsService";
import { PurchasesService } from "../services/PurchasesService";
import { useMeStore } from "../stores/useMeStore";
import { useProStore } from "../stores/useProStore";
import { ProController } from "./ProController";
import { ToastController } from "./ToastController";

/** Paywall'ın açıldığı yer — ekran başlığı ve analitik için */
export type PaywallSource = "onboarding" | "home" | "profile" | "quota_lesson" | "quota_roleplay";

/** Gösterilen planların mağaza nesneleri (satın alma bunları ister) */
let offered: PurchasesPackage[] = [];
/** Paywall ekranda: ikinci giriş (hızlı dokunuş, iki kez tetiklenen kota) üst üste açmaz */
let open = false;
/** Ekrandaki paywall'ın kapanmasını bekleyenler (`openUntilClosed`) */
let closedWaiters: (() => void)[] = [];

const isPro = () => useMeStore.getState().me?.entitlement.isPro || useProStore.getState().storeActive;
// Tam ekran modal üstünde toast görünmez — uyarı Alert ile
const notice = (title: string, message?: string) => Alert.alert(title, message);

/**
 * GlotMate Pro paywall'ı — her Pro girişinden açılır: offering planları
 * mağaza fiyatlarıyla, satın alma, geri yükleme. RevenueCat'siz derleme
 * görünümü önizleme fiyatlarıyla gösterir, hiçbir şey satın almaz.
 */
export class PaywallController {
  /** Paywall; Pro kullanıcı için mağazanın abonelik sayfası */
  static open(source: PaywallSource): void {
    if (open) return;
    if (isPro()) {
      void ProController.manageSubscriptions().catch(() => undefined);
      return;
    }
    open = true;
    router.push({ pathname: "/paywall", params: { source } });
  }

  /** Paywall bir ADIM olarak (onboarding): kapanınca çözülür. Pro kullanıcıda hemen. */
  static openUntilClosed(source: PaywallSource): Promise<void> {
    if (isPro()) return Promise.resolve();
    return new Promise((resolve) => {
      closedWaiters.push(resolve);
      this.open(source);
    });
  }

  /** Ekran takıldı/söküldü — üst üste açılma koruması gerçek ekranı izler */
  static mounted(): void {
    open = true;
  }

  static unmounted(): void {
    open = false;
    const waiters = closedWaiters;
    closedWaiters = [];
    waiters.forEach((w) => w());
  }

  /** Offering planları (ya da önizleme) — store'a */
  static async load(): Promise<void> {
    const store = useProStore.getState();
    if (!PurchasesService.configured) {
      store.set({ plans: toPlans(PREVIEW_PACKAGES, new Set(PREVIEW_PACKAGES.map((p) => p.product.identifier))), preview: true });
      return;
    }
    try {
      const packages = await PurchasesService.currentPackages();
      offered = packages;
      const eligible = await PurchasesService.trialEligible(packages.map((p) => p.product.identifier)).catch(
        () => new Set<string>(),
      );
      store.set({ plans: toPlans(packages as unknown as StorePackage[], eligible), preview: false });
    } catch {
      store.set({ plans: [] });
    }
  }

  static async purchase(key: string): Promise<void> {
    const store = useProStore.getState();
    if (store.preview) {
      notice(tr.paywall.preview);
      return;
    }
    const pkg = offered.find((p) => p.identifier === key);
    if (!pkg || store.purchasing) return;
    store.set({ purchasing: true });
    try {
      const result = await PurchasesService.purchase(pkg);
      if (result === "cancelled") return;
      useProStore.getState().set({ storeActive: true });
      await ProController.refreshEntitlement();
      HapticsService.success();
      this.close();
      ToastController.success(tr.paywall.purchased, tr.paywall.purchasedBody);
    } catch {
      notice(tr.paywall.failed, tr.errors.generic);
    } finally {
      useProStore.getState().set({ purchasing: false });
    }
  }

  static async restore(): Promise<void> {
    const store = useProStore.getState();
    if (store.preview) {
      notice(tr.paywall.preview);
      return;
    }
    if (store.restoring) return;
    store.set({ restoring: true });
    try {
      await PurchasesService.restore();
      const pro = await ProController.refreshEntitlement();
      if (pro || useProStore.getState().storeActive) {
        HapticsService.success();
        this.close();
        ToastController.success(tr.paywall.restored);
      } else {
        notice(tr.paywall.nothingToRestore);
      }
    } catch {
      notice(tr.paywall.failed, tr.errors.generic);
    } finally {
      useProStore.getState().set({ restoring: false });
    }
  }

  static close(): void {
    if (router.canGoBack()) router.back();
  }

  static openLegal(kind: "terms" | "privacy"): void {
    void BrowserService.open(LEGAL[kind]);
  }
}

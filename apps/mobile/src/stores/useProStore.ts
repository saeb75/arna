import { create } from "zustand";
import type { ProPlan } from "../domain/pro";

/**
 * Mağaza tarafı: paywall planları, satın alma durumu ve RevenueCat'in
 * gördüğü aktif abonelik. Sunucunun kararı (`me.entitlement`) useMeStore'da;
 * Pro = ikisinden biri (bkz. usePro).
 */
interface ProState {
  /** null = yükleniyor */
  plans: ProPlan[] | null;
  /** RevenueCat yapılandırılmadı — planlar önizleme, satın alma kapalı */
  preview: boolean;
  /** RevenueCat'e göre entitlement aktif (sunucu henüz bilmiyor olabilir) */
  storeActive: boolean;
  purchasing: boolean;
  restoring: boolean;
  set: (p: Partial<Omit<ProState, "set">>) => void;
}

export const useProStore = create<ProState>((set) => ({
  plans: null,
  preview: false,
  storeActive: false,
  purchasing: false,
  restoring: false,
  set: (p) => set(p),
}));

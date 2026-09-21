import { create } from "zustand";

/**
 * OTA güncelleme durumu. Store'a YALNIZ UpdatesController yazar
 * (CLAUDE.md sözleşmesi) — bileşen yalnız okur.
 *
 * `pending`: güncelleme İNDİRİLDİ ve yeniden başlatmayı bekliyor. Yalnızca bu
 * durumda kullanıcıya kart gösterilir; "indiriliyor" ara durumu kasten yok —
 * henüz uygulanamayan bir şeyi duyurmak kullanıcıya iş çıkarmaz.
 * `applying`: reload çağrıldı, süreç yeniden başlıyor.
 */
interface UpdatesState {
  pending: boolean;
  applying: boolean;
  setPending: (v: boolean) => void;
  setApplying: (v: boolean) => void;
}

export const useUpdatesStore = create<UpdatesState>((set) => ({
  pending: false,
  applying: false,
  setPending: (pending) => set({ pending }),
  setApplying: (applying) => set({ applying }),
}));

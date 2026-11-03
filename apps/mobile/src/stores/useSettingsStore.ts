import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SchemeSetting } from "../theme/scheme";

/**
 * Cihazda kalıcı küçük tercihler — görünüm ve günlük hatırlatıcı. Sunucuya
 * gitmez: profil alanları (seviye, hedef…) `useMeStore`'da, sunucudan gelir.
 * Store'a yalnız controller'lar yazar (CLAUDE.md); `setScheme` görünüm satırının
 * doğrudan aksiyonu olduğundan SettingsController'ın tek satırlık sarmalı yok —
 * bkz. AppearanceRow (istisna gerekçesi orada).
 */
interface SettingsState {
  /** Açık / koyu: "system" telefonu izler */
  scheme: SchemeSetting;
  /** Günlük hatırlatıcı açık mı (izin verildiyse) */
  reminderOn: boolean;
  /** "HH:MM", yerel saat */
  reminderTime: string;
  hydrated: boolean;
  set: (p: Partial<Omit<SettingsState, "set" | "hydrated">>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      scheme: "system",
      reminderOn: false,
      reminderTime: "20:00",
      hydrated: false,
      set: (p) => set(p),
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ scheme, reminderOn, reminderTime }) => ({ scheme, reminderOn, reminderTime }),
      onRehydrateStorage: () => () => useSettingsStore.setState({ hydrated: true }),
    },
  ),
);

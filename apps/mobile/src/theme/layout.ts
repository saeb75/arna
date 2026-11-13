import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Native sekme barının içerik yüksekliği (13 Kas 2026'dan beri bar NATIVE — AppTabs).
 * iOS'ta bar saydam/cam ve içeriğin ÜSTÜNDE durur (ekran altına kadar uzanır); Android'de
 * Material bar düzenin içindedir, içerik zaten onun üstünde biter.
 */
const IOS_TAB_BAR_HEIGHT = 49;

/** Sekme ekranı içeriğinin alt boşluğu: her şey barın üstünde kalsın */
export function useTabBarSpace(): number {
  const { bottom } = useSafeAreaInsets();
  return Platform.OS === "ios" ? bottom + IOS_TAB_BAR_HEIGHT + 20 : 24;
}

/** Sekmesiz sayfanın alt boşluğu: ev göstergesini aşsın */
export function usePageBottomSpace(): number {
  return useSafeAreaInsets().bottom + 24;
}

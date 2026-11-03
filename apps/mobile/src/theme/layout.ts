import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Yüzen sekme barının yüksekliği */
export const TAB_BAR_HEIGHT = 64;

/** Barın ekran altından uzaklığı (ev göstergesinin biraz içine girer) */
export function useTabBarBottom(): number {
  return Math.max(useSafeAreaInsets().bottom - 8, 12);
}

/** Sekme ekranı içeriğinin alt boşluğu: her şey barın üstünde kalsın */
export function useTabBarSpace(): number {
  return useTabBarBottom() + TAB_BAR_HEIGHT + 24;
}

/** Sekmesiz sayfanın alt boşluğu: ev göstergesini aşsın */
export function usePageBottomSpace(): number {
  return useSafeAreaInsets().bottom + 24;
}

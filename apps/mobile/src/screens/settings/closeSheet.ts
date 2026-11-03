import { router } from "expo-router";

/** Seçimden sonra sheet 320 ms bekleyip kapanır — onayın oturduğu görülsün (GlotCast kuralı). */
export function closeSheetSoon(): void {
  setTimeout(() => {
    if (router.canGoBack()) router.back();
  }, 320);
}

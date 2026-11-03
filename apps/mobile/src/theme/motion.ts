import { Easing, FadeInDown } from "react-native-reanimated";

/**
 * Uygulamanın GİRİŞ hareketi (GlotCast dili): yumuşak yükseliş + belirme,
 * ease-out, ZIPLAMA YOK, yay YOK. `i` bir ekranın parçalarını 60 ms arayla
 * kademelendirir. Reanimated, "Hareketi Azalt" açıkken kendiliğinden atlar.
 */
export const enter = (i: number, base = 60) =>
  FadeInDown.delay(base + i * 60)
    .duration(420)
    .easing(Easing.out(Easing.cubic));

/** Süre ölçeği — küçük geçişler 180–220, durum değişimi 260–320, sayfa 380–420 ms */
export const DURATION = { quick: 200, state: 300, page: 400 } as const;

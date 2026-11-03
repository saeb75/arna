import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut } from "react-native-reanimated";
import { HapticsService } from "../../services/HapticsService";
import { useTabBarSpace } from "../../theme/layout";
import type { NodeRect } from "./PathNode";

/** Kartın yaklaşık yüksekliği — altta yer yoksa düğümün ÜSTÜNDE açılır */
const CARD_H = 132;
const GAP = 14;
const SIDE = 16;

/**
 * Düğüme dokununca açılan kart (Duolingo yapısı, bizim renk): ders adı, ünitedeki
 * sırası ve tek eylem. Ok düğümü gösterir. Boşluğa dokunmak ya da kaydırmak kapatır.
 * (Konum düğümün ölçülen yerinden — çalışma zamanı değeri, gerekçeli inline stil.)
 */
export function NodePopover({
  rect,
  title,
  subtitle,
  action,
  onAction,
  onClose,
}: {
  rect: NodeRect;
  title: string;
  subtitle: string;
  action: string;
  onAction: () => void;
  onClose: () => void;
}) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const bottomSpace = useTabBarSpace();
  const below = rect.y + rect.height + GAP + CARD_H < screenH - bottomSpace;
  // Yukarıda açılırken ALT kenardan sabitlenir: kartın gerçek yüksekliği ne olursa olsun düğüme yapışık
  const place = below ? { top: rect.y + rect.height + GAP } : { bottom: screenH - rect.y + GAP };
  const arrowLeft = Math.max(20, Math.min(screenW - 2 * SIDE - 20, rect.x + rect.width / 2 - SIDE)) - 8;
  const fade = FadeIn.duration(160).easing(Easing.out(Easing.cubic));

  return (
    <Pressable className="absolute inset-0 z-20" onPress={onClose} accessibilityLabel={title}>
      <Animated.View entering={fade} exiting={FadeOut.duration(120)} className="absolute" style={{ ...place, left: SIDE, right: SIDE }}>
        {below ? <View className="absolute -top-2 size-4 rotate-45 bg-brand-strong" style={{ left: arrowLeft }} /> : null}
        {/* Kartın kendisi dokunuşu yutar — kapanma yalnız dışarıda */}
        <Pressable onPress={() => {}} className="gap-3 rounded-2xl bg-brand-strong p-4">
          <View className="gap-0.5">
            <Text numberOfLines={2} className="text-lg font-extrabold leading-6 text-on-brand">
              {title}
            </Text>
            <Text className="text-sm font-medium text-on-brand/80">{subtitle}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              HapticsService.tap();
              onAction();
            }}
            className="h-12 items-center justify-center rounded-xl border-b-4 border-scrim/15 bg-on-brand active:opacity-90"
          >
            <Text className="text-base font-extrabold tracking-wide text-brand-strong">{action}</Text>
          </Pressable>
        </Pressable>
        {!below ? <View className="absolute -bottom-2 size-4 rotate-45 bg-brand-strong" style={{ left: arrowLeft }} /> : null}
      </Animated.View>
    </Pressable>
  );
}

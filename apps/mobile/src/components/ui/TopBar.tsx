import type { ReactNode } from "react";
import { Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { RoundIconButton } from "./RoundIconButton";

/**
 * İtilmiş sayfanın üstü: yuvarlak geri (ya da kapat), isteğe bağlı sağ eylem
 * ve sayfa kendi başlığını geçince beliren başlık (`scrollY`, `titleAfter` px).
 * İçeriğin üstünde YÜZER.
 */
export function TopBar({
  title,
  scrollY,
  titleAfter = 160,
  right,
  close = false,
  onBack,
}: {
  title?: string;
  scrollY?: SharedValue<number>;
  titleAfter?: number;
  right?: ReactNode;
  close?: boolean;
  onBack?: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bar = useAnimatedStyle(() => {
    const y = scrollY?.value ?? 0;
    return { opacity: scrollY ? interpolate(y, [titleAfter - 40, titleAfter], [0, 1], "clamp") : 0 };
  });
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")));
  const Icon = close ? X : ChevronLeft;
  return (
    // Üst güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="absolute inset-x-0 top-0 z-10" style={{ paddingTop: insets.top + 4 }} pointerEvents="box-none">
      <Animated.View pointerEvents="none" className="absolute inset-0 border-b border-border bg-background" style={bar} />
      <View className="h-14 flex-row items-center justify-between gap-3 px-4" pointerEvents="box-none">
        <RoundIconButton
          icon={<Icon color={colors.foreground} size={22} strokeWidth={2.2} />}
          label={close ? tr.common.close : tr.common.back}
          onPress={back}
        />
        {title ? (
          <Animated.View className="flex-1" style={bar} pointerEvents="none">
            <Text numberOfLines={1} className="text-center text-base font-semibold text-foreground">
              {title}
            </Text>
          </Animated.View>
        ) : (
          <View className="flex-1" />
        )}
        <View className="min-w-12 items-end">{right}</View>
      </View>
    </View>
  );
}

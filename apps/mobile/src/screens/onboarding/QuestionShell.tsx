import type { ReactNode } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

export const rise = (i: number) => FadeInDown.delay(80 + i * 60).duration(420).easing(Easing.out(Easing.cubic));

export interface ShellProps {
  progress: number;
  index: number;
  total: number;
  onBack?: () => void;
}

/**
 * Bir sorunun sayfası: üstte geri + sorular boyunca ilerleme, soru, cevaplar
 * (çocuklar, gerekirse kayar) ve altta sayfanın eylemi.
 */
export function QuestionShell({
  progress,
  index,
  total,
  title,
  body,
  onBack,
  footer,
  children,
}: ShellProps & { title: string; body?: string; footer?: ReactNode; children: ReactNode }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 6 }}>
      <View className="h-12 flex-row items-center gap-3 px-4">
        <View className="w-10">
          {onBack ? (
            <RoundIconButton variant="muted" icon={<ChevronLeft color={colors.foreground} size={22} />} label={tr.common.back} onPress={onBack} />
          ) : null}
        </View>
        <View className="flex-1">
          <ProgressBar value={progress} className="h-2" />
        </View>
        <Text className="w-10 text-right text-xs font-semibold tabular-nums text-muted-foreground">{tr.onboarding.questionCount(index, total)}</Text>
      </View>
      <View className="gap-2 px-6 pb-4 pt-5">
        <Animated.Text entering={rise(0)} accessibilityRole="header" className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">
          {title}
        </Animated.Text>
        {body ? (
          <Animated.Text entering={rise(1)} className="text-base leading-snug text-muted-foreground">
            {body}
          </Animated.Text>
        ) : null}
      </View>
      <View className="flex-1">{children}</View>
      {footer ? (
        <View className="px-6 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </View>
  );
}

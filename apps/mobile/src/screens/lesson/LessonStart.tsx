import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, GraduationCap, RotateCcw } from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import { CtaButton } from "../../components/ui/CtaButton";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { TopBar } from "../../components/ui/TopBar";
import { tr } from "../../i18n/tr";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Başlamadan önce: başlık + tema + başlat. Açık oturum varsa iki yol: aynı
 * oturumda devam ya da terk edip baştan. Oturum BURADA değil, butonla açılır.
 */
export function LessonStart({
  title,
  theme,
  hasResume,
  busy,
  onStart,
  onResume,
  onRestart,
}: {
  title: string;
  theme: string;
  hasResume: boolean;
  busy: boolean;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas" style={{ paddingBottom: insets.bottom + 12 }}>
      <ScreenGlow height={520} />
      <TopBar close />
      <View className="flex-1 justify-center gap-6 px-6">
        <Animated.View entering={enter(0)} className="size-20 items-center justify-center rounded-3xl bg-brand/15">
          <GraduationCap color={colors.brand} size={38} />
        </Animated.View>
        <View className="gap-2">
          <Animated.Text entering={enter(1)} className="text-xs font-bold tracking-widest text-brand">
            {tr.lesson.eyebrow}
          </Animated.Text>
          <Animated.Text entering={enter(2)} className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            {title}
          </Animated.Text>
          <Animated.Text entering={enter(3)} className="text-lg leading-snug text-muted-foreground">
            {theme}
          </Animated.Text>
        </View>
        <Animated.View entering={enter(4)} className="flex-row flex-wrap gap-2">
          <View className="h-8 flex-row items-center gap-1.5 rounded-full bg-muted px-3">
            <Clock color={colors["muted-foreground"]} size={14} />
            <Text className="text-sm font-semibold text-muted-foreground">{tr.lesson.minutes}</Text>
          </View>
          <View className="h-8 flex-row items-center gap-1.5 rounded-full bg-muted px-3">
            <GraduationCap color={colors["muted-foreground"]} size={14} />
            <Text className="text-sm font-semibold text-muted-foreground">{tr.lesson.withEmma}</Text>
          </View>
        </Animated.View>
      </View>
      <Animated.View entering={enter(5)} className="gap-2 px-6">
        {hasResume ? (
          <>
            <CtaButton label={tr.lesson.resume} busy={busy} onPress={onResume} breathe />
            <Button label={tr.lesson.restart} variant="ghost" icon={<RotateCcw color={colors.foreground} size={16} />} disabled={busy} onPress={onRestart} />
          </>
        ) : (
          <CtaButton label={tr.lesson.start} busy={busy} onPress={onStart} breathe />
        )}
      </Animated.View>
    </View>
  );
}

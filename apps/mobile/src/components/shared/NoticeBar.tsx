import { Text } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { CircleAlert } from "lucide-react-native";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Kısa sistem uyarısı — ses ya da sohbet aksadığında (STT düştü, cevap alınamadı,
 * ses çalınamadı). Eskiden bu anlar SESSİZDİ: öğrenci konuşuyor, hiçbir şey
 * olmuyor, hiçbir şey söylenmiyordu ("cevap veriyorum, hoca cevap vermiyor").
 * Ders ve rol yapma ekranı ortak kullanır; metni controller seçer, bileşen karar vermez.
 */
export function NoticeBar({ text }: { text: string }) {
  const colors = useThemeColors();
  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      exiting={FadeOut.duration(180)}
      accessibilityRole="alert"
      className="mx-4 mb-2 flex-row items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3"
    >
      <CircleAlert color={colors.destructive} size={18} strokeWidth={2.4} />
      <Text className="flex-1 text-[14px] leading-5 text-foreground">{text}</Text>
    </Animated.View>
  );
}

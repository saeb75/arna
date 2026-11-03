import { View } from "react-native";
import { Lightbulb, X } from "lucide-react-native";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/** Ders üstü: ✕ (ÇIKIŞ — bitirme değil), ilerleme, ipucu. */
export function LessonTopBar({ progress, onClose, onHint }: { progress: number; onClose: () => void; onHint: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="h-14 flex-row items-center gap-3 px-4">
      <RoundIconButton variant="muted" icon={<X color={colors.foreground} size={20} />} label={tr.common.close} onPress={onClose} />
      <View className="flex-1">
        <ProgressBar value={progress} className="h-2.5" />
      </View>
      <RoundIconButton variant="muted" icon={<Lightbulb color={colors.warning} size={20} />} label={tr.lesson.hint} onPress={onHint} />
    </View>
  );
}

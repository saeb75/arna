import { Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/** Oyun üstü: ✕ (çıkış, kaydetmez), başlık + ilerleme, "Bitir" (TEK bitirici). */
export function PlayTopBar({ title, done, total, onClose, onFinish }: { title: string; done: number; total: number; onClose: () => void; onFinish: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="h-14 flex-row items-center gap-3 px-4">
      <RoundIconButton variant="muted" icon={<X color={colors.foreground} size={20} />} label={tr.common.close} onPress={onClose} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-bold text-foreground">
          {title}
        </Text>
        <Text className="text-xs font-semibold tabular-nums text-muted-foreground">
          {tr.roleplay.lastScore(done, total)} · {tr.roleplay.goals(total)}
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onFinish} className="h-10 items-center justify-center rounded-full bg-primary px-5 active:opacity-80">
        <Text className="text-[15px] font-bold text-primary-foreground">{tr.roleplay.play.finish}</Text>
      </Pressable>
    </View>
  );
}

import { View } from "react-native";
import Animated from "react-native-reanimated";
import { Trophy } from "lucide-react-native";
import { CtaButton } from "../../../components/ui/CtaButton";
import { LessonSessionController } from "../../../controllers/LessonSessionController";
import { tr } from "../../../i18n/tr";
import { enter } from "../../../theme/motion";
import { useThemeColors } from "../../../theme/useThemeColors";

/** Blok sonu — kısa özet ve rol yapmaya geçiş (tek ana eylem) */
export function DrillSummary({ ok, total }: { ok: number; total: number }) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 justify-between px-5 pb-2">
      <View className="flex-1 items-center justify-center gap-4">
        <Animated.View entering={enter(0)} className="size-20 items-center justify-center rounded-full bg-brand/15">
          <Trophy color={colors.brand} size={38} strokeWidth={2.2} />
        </Animated.View>
        <Animated.Text entering={enter(1)} className="text-center text-2xl font-extrabold tracking-tight text-foreground">
          {tr.drill.doneTitle}
        </Animated.Text>
        <Animated.Text entering={enter(2)} className="text-center text-base text-muted-foreground">
          {tr.drill.doneBody(ok, total)}
        </Animated.Text>
      </View>
      <Animated.View entering={enter(3)}>
        <CtaButton breathe label={tr.drill.toRoleplay} onPress={() => LessonSessionController.afterDrills()} />
      </Animated.View>
    </View>
  );
}

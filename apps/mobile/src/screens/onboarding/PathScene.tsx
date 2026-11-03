import { Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { BookOpen, Check, Mic, Trophy, Users } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { useLoopStep } from "./useLoopStep";

const ICONS = [Users, BookOpen, Mic, Trophy];
/** Zikzak kayması — ders yolunun kendi dili (merkez, sol, merkez, sağ) */
const SIDE = ["", "-translate-x-12", "", "translate-x-12"];

/** Tanıtım 3: mini ders yolu — düğümler sırayla yanar. */
export function PathScene() {
  const colors = useThemeColors();
  const labels = tr.onboarding.scenes.pathLabels;
  const step = useLoopStep(labels.length + 1, 900);
  return (
    <View className="gap-1 rounded-3xl border border-border bg-card px-4 py-5">
      {labels.map((label, i) => {
        const Icon = ICONS[i] ?? BookOpen;
        const done = step > i;
        const current = step === i;
        return (
          <View key={label} className={`items-center gap-1.5 ${SIDE[i] ?? ""}`}>
            <View className={`size-14 items-center justify-center overflow-hidden rounded-full ${done ? "bg-brand/15" : current ? "" : "bg-muted"}`}>
              {current ? <GradientFill /> : null}
              <Icon color={current ? colors["on-brand"] : done ? colors.brand : colors["muted-foreground"]} size={22} />
              {done ? (
                <Animated.View entering={ZoomIn.duration(240)} className="absolute -bottom-0.5 -right-0.5 size-6 items-center justify-center rounded-full border-2 border-card bg-positive">
                  <Check color={colors["on-brand"]} size={12} strokeWidth={3.4} />
                </Animated.View>
              ) : null}
            </View>
            <Text className={`text-xs ${current ? "font-bold text-foreground" : "text-muted-foreground"}`}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

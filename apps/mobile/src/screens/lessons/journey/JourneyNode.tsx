import { View } from "react-native";
import { BookOpen, Check, MessageCircle, Mic, Play, Trophy, type LucideIcon } from "lucide-react-native";
import type { LessonKind } from "@glotmate/contracts";
import { GradientFill } from "../../../components/ui/GradientFill";
import type { NodeState } from "../../../lib/lessonPath";
import { useThemeColors } from "../../../theme/useThemeColors";

/** Ders tipi → glif. Ekranda iç terim YAZMAZ, yalnız ikon konuşur. */
const ICON: Record<LessonKind, LucideIcon> = {
  phrases: MessageCircle,
  grammar: BookOpen,
  practice: Mic,
};

export const NODE_SIZE = 46;
export const CURRENT_NODE_SIZE = 54;

/**
 * Yolculuk düğümü — yumuşak kabarık daire. Kaldığın ders marka gradyanı + oynat
 * glifi + dış hale; bitmiş derste yeşil onay rozeti; ünite testi altın yüz + kupa.
 * Diğerleri nötr kart yüzeyi (dersler kilitli DEĞİL — sönüklük yalnız görsel).
 */
export function JourneyNode({ kind, state, test }: { kind: LessonKind | null; state: NodeState; test: boolean }) {
  const colors = useThemeColors();
  const current = state === "current";
  const size = current ? CURRENT_NODE_SIZE : NODE_SIZE;
  const Icon = test ? Trophy : current ? Play : ICON[kind ?? "phrases"];

  return (
    // Ölçü duruma göre — gerekçeli inline stil
    <View style={{ width: size, height: size }}>
      {current ? <View className="absolute -inset-1.5 rounded-full bg-brand/15" /> : null}
      <View
        className={`flex-1 items-center justify-center overflow-hidden rounded-full border-2 shadow-sm shadow-scrim/15 ${
          test ? "border-test-halo bg-test-face" : current ? "border-card" : "border-card bg-path-ring"
        }`}
      >
        {current ? <GradientFill vertical /> : null}
        <Icon
          color={test ? colors["test-icon"] : current ? colors["on-brand"] : colors["muted-foreground"]}
          fill={current ? colors["on-brand"] : "transparent"}
          size={current ? 20 : 18}
          strokeWidth={current ? 2.2 : 1.8}
        />
      </View>
      {state === "completed" ? (
        <View className="absolute -right-1 -top-1 size-[18px] items-center justify-center rounded-full border-2 border-card bg-positive">
          <Check color={colors["on-brand"]} size={10} strokeWidth={3.6} />
        </View>
      ) : null}
    </View>
  );
}

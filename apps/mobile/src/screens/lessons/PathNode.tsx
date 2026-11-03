import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Blocks, Check, MessagesSquare, Mic, Trophy, type LucideIcon } from "lucide-react-native";
import type { LessonKind } from "@glotmate/contracts";
import { tr } from "../../i18n/tr";
import { CURRENT_EXTRA_H, NODE_ROW_H, waveX, type NodeState } from "../../lib/lessonPath";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

/** Ders tipi → glif. Ekranda "phrases/grammar" gibi iç terim YAZMAZ, yalnız ikon konuşur. */
const ICON: Record<LessonKind | "test", LucideIcon> = {
  phrases: MessagesSquare,
  grammar: Blocks,
  practice: Mic,
  test: Trophy,
};

/** Düğüm yüzü ve altındaki "dudak" (kalınlık) */
const FACE = 72;
const LIP = 8;

export interface NodeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PathNodeProps {
  kind: LessonKind | "test";
  /** Erişilebilirlik etiketi — ekranda yazılmaz (dokununca kart açılır) */
  title: string;
  state: NodeState;
  /** Ünite içi sıra — dalgadaki yatay konum (`waveX`) */
  step: number;
  /** Yarım kalmış ders: balonda "DEVAM" */
  inProgress?: boolean;
  /** Düğümün ekrandaki yeri — kart onun altında açılır */
  onPress: (rect: NodeRect) => void;
}

/**
 * Yolun tek düğümü — yapı Duolingo'ya benzer, renkler bizim: düz yüz + altta
 * koyu dudak; basınca yüz dudağın üstüne iner. Bitmiş ve kaldığın ders ember,
 * başlanmamış gri. Kaldığın dersin etrafında halka, üstünde süzülen "BAŞLA"
 * balonu. Etiket yok. Yükseklik lib'den (getItemLayout ile BİREBİR).
 */
export function PathNode({ kind, title, state, step, inProgress = false, onPress }: PathNodeProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const ref = useRef<View>(null);
  const pressed = useSharedValue(0);
  const float = useSharedValue(0);
  const current = state === "current";
  const on = state !== "upcoming";

  useEffect(() => {
    if (!current || reduceMotion) return;
    float.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [current, reduceMotion, float]);

  // Basma ve balonun süzülmesi: öteleme animasyonu sınıfla ifade edilemez
  const face = useAnimatedStyle(() => ({ transform: [{ translateY: pressed.value * LIP }] }));
  const bubble = useAnimatedStyle(() => ({ transform: [{ translateY: -float.value * 4 }] }));

  const Icon = state === "completed" ? Check : ICON[kind];
  const top = current ? CURRENT_EXTRA_H + 10 : 12;

  return (
    <View style={{ height: current ? NODE_ROW_H + CURRENT_EXTRA_H : NODE_ROW_H }}>
      {/* Dalgadaki konum ÇALIŞMA ZAMANI değeri — gerekçeli inline stil */}
      <View className="absolute items-center" style={{ top, left: "50%", marginLeft: waveX(step) - FACE / 2, width: FACE }}>
        {current ? (
          <>
            <View
              className="absolute rounded-full border-[7px] border-muted"
              style={{ width: FACE + 26, height: FACE + 26, top: -13 + LIP / 2 }}
            />
            <Animated.View className="absolute items-center" style={[{ top: -CURRENT_EXTRA_H - 4, width: 120 }, bubble]}>
              <View className="rounded-xl border-2 border-border bg-card px-3.5 py-1.5">
                <Text className="text-[13px] font-extrabold tracking-wider text-brand">
                  {inProgress ? tr.home.bubbleContinue : tr.home.bubbleStart}
                </Text>
              </View>
              <View className="-mt-[7px] size-3 rotate-45 border-b-2 border-r-2 border-border bg-card" />
            </Animated.View>
          </>
        ) : null}
        <Pressable
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={title}
          hitSlop={6}
          onPressIn={() => {
            pressed.value = withTiming(1, { duration: 70 });
          }}
          onPressOut={() => {
            pressed.value = withTiming(0, { duration: 140 });
          }}
          onPress={() => {
            HapticsService.tap();
            ref.current?.measureInWindow((x, y, width, height) => onPress({ x, y, width, height }));
          }}
          style={{ width: FACE, height: FACE + LIP }}
        >
          <View className={`absolute rounded-full ${on ? "bg-node-on-lip" : "bg-node-off-lip"}`} style={{ top: LIP, width: FACE, height: FACE }} />
          <Animated.View
            className={`items-center justify-center rounded-full ${on ? "bg-node-on" : "bg-node-off"}`}
            style={[{ width: FACE, height: FACE }, face]}
          >
            <Icon color={on ? colors["on-brand"] : colors["node-off-icon"]} size={state === "completed" ? 34 : 30} strokeWidth={state === "completed" ? 3.6 : 2.6} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

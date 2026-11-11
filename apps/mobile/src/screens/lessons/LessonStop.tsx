import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Blocks, Check, MessagesSquare, Mic, type LucideIcon } from "lucide-react-native";
import type { LessonKind } from "@glotmate/contracts";
import { tr } from "../../i18n/tr";
import { ROAD_R, type NodeRect, type PathStop } from "../../lib/lessonPath";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";
import { usePressDip } from "./usePressDip";

/** Ders tipi → glif. Ekranda "phrases/grammar" gibi iç terim YAZMAZ, yalnız ikon konuşur. */
const ICON: Record<LessonKind, LucideIcon> = {
  phrases: MessagesSquare,
  grammar: Blocks,
  practice: Mic,
};

// NativeWind sınıfları derleme anında taranır — renk sınıfları DÜZ metin olarak burada
const FACE = ["bg-path-1", "bg-path-2", "bg-path-3", "bg-path-4", "bg-path-5", "bg-path-6"];
const LIP = ["bg-path-1-lip", "bg-path-2-lip", "bg-path-3-lip", "bg-path-4-lip", "bg-path-5-lip", "bg-path-6-lip"];
const HALO = ["bg-path-1/20", "bg-path-2/20", "bg-path-3/20", "bg-path-4/20", "bg-path-5/20", "bg-path-6/20"];
const INK_TEXT = [
  "text-path-1-ink",
  "text-path-2-ink",
  "text-path-3-ink",
  "text-path-4-ink",
  "text-path-5-ink",
  "text-path-6-ink",
];
const INK = ["path-1-ink", "path-2-ink", "path-3-ink", "path-4-ink", "path-5-ink", "path-6-ink"] as const;

/**
 * Ders durağı: yumuşak halka içinde renkli yüz + dudak, ikon ders tipinden.
 * Bitmişte köşede onay rozeti; kaldığın derste büyük renkli halka ve etiketin
 * üstünde "BAŞLA/DEVAM". Ders adı (İngilizce katalog başlığı) düğümün altında.
 */
export function LessonStop({
  stop,
  x,
  labelWidth,
  onPress,
}: {
  stop: Extract<PathStop, { kind: "lesson" }>;
  x: number;
  labelWidth: number;
  onPress: (stop: PathStop, rect: NodeRect) => void;
}) {
  const colors = useThemeColors();
  const ref = useRef<View>(null);
  const current = stop.state === "current";
  const done = stop.state === "completed";
  const ring = current ? 100 : 84;
  const face = current ? 78 : 66;
  const lip = current ? 7 : 6;
  const press = usePressDip(lip);
  const Icon = ICON[stop.lesson.kind];
  const t = stop.tint;

  return (
    // Yoldaki konum ÇALIŞMA ZAMANI değeri (ekran genişliğinden) — gerekçeli inline stil
    <View className="absolute items-center" style={{ left: x - labelWidth / 2, top: ROAD_R - ring / 2, width: labelWidth }}>
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={stop.lesson.title}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onPress={() => {
          HapticsService.tap();
          ref.current?.measureInWindow((rx, ry, w, h) => onPress(stop, { x: rx, y: ry, width: w, height: h }));
        }}
        className={`items-center justify-center rounded-full ${current ? HALO[t] : "bg-path-ring"}`}
        style={{ width: ring, height: ring }}
      >
        <View style={{ width: face, height: face + lip, marginTop: -lip }}>
          <View className={`absolute rounded-full ${LIP[t]}`} style={{ top: lip, width: face, height: face }} />
          <Animated.View className={`items-center justify-center rounded-full ${FACE[t]}`} style={[{ width: face, height: face }, press.style]}>
            <Icon color={colors["on-brand"]} size={current ? 34 : 29} strokeWidth={2.4} />
          </Animated.View>
        </View>
        {done ? (
          <View className="absolute right-0 top-0.5 size-6 items-center justify-center rounded-full bg-card shadow-sm shadow-scrim/20">
            <Check color={colors[INK[t]]} size={14} strokeWidth={3.6} />
          </View>
        ) : null}
      </Pressable>
      <View className="mt-1.5 items-center">
        {current ? (
          <Text className={`text-[11px] font-extrabold tracking-widest ${INK_TEXT[t]}`}>
            {stop.lesson.status === "in_progress" ? tr.home.bubbleContinue : tr.home.bubbleStart}
          </Text>
        ) : null}
        <Text
          numberOfLines={2}
          className={`text-center leading-[18px] ${current ? "text-[14px] font-extrabold text-foreground" : "text-[13px] font-bold text-foreground/75"}`}
        >
          {stop.lesson.title}
        </Text>
      </View>
    </View>
  );
}


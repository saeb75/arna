import { useEffect, useMemo, type ComponentProps } from "react";
import { Animated, Pressable, Text, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { LessonKind } from "@glotmate/contracts";
import { NODE_CY, NODE_ROW_H, type NodeState, type PathPos, type SpineLine } from "../../lib/lessonPath";
import colors from "../../../colors";
import { PathCurve, laneX } from "./PathCurve";

type Glyph = ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Ders tipi → glif. Ekranda "phrases/grammar" gibi iç terim YAZMAZ, yalnız ikon konuşur. */
const ICON: Record<LessonKind | "test", Glyph> = {
  phrases: "presentation",
  grammar: "alphabetical-variant",
  practice: "dumbbell",
  test: "trophy",
};

/** Daire çapı (pt) — sınıfla (h-[72px] w-[72px]) aynı olmalı; size-18 Tailwind ölçeğinde YOK, sessizce üretilmiyor */
const NODE = 72;
const LABEL_W = 168;

const CIRCLE: Record<NodeState, string> = {
  completed: "bg-primary",
  current: "bg-primary",
  // Sınav açık ama henüz geçilmedi: dolu mor DEĞİL, çerçeveli — "şu an buradasın"
  // ile "burası seni bekliyor" bir örnek görünmemeli.
  ready: "border-[3px] border-primary bg-card",
  upcoming: "border-[3px] border-nodeIdle bg-card",
};

const ICON_COLOR: Record<NodeState, string> = {
  completed: colors.onPrimary,
  current: colors.onPrimary,
  ready: colors.primary,
  upcoming: colors.muted,
};

interface LessonRowProps {
  kind: LessonKind | "test";
  /** Dairenin altındaki ad — ders başlığı (kanonik İngilizce) ya da "Ünite testi" */
  label: string;
  /** İnce alt satır (ör. testin en iyi sonucu) */
  sublabel?: string;
  state: NodeState;
  line: SpineLine;
  pos: PathPos;
  onPress: () => void;
}

/**
 * Yolun tek düğümü: eğri parçaları + şeridine oturan büyük daire + altında ad.
 * Yükseklik lib'den: FlatList getItemLayout ile BİREBİR aynı olmak zorunda;
 * başlık bu yüzden EN FAZLA iki satır. Yatay konum ekran genişliğinden türeyen
 * ÇALIŞMA ZAMANI değeri — gerekçeli inline stil.
 */
export function LessonRow({ kind, label, sublabel, state, line, pos, onPress }: LessonRowProps) {
  const { width } = useWindowDimensions();
  const x = laneX(pos.lane, width);
  const current = state === "current";

  // Nefes alan hâle yalnız "şu an buradasın" düğümünde. Hook koşulsuz çalışır,
  // döngü yalnız current'ta başlar. useMemo: ref'e render'da erişmek lint hatası.
  const scale = useMemo(() => new Animated.Value(1), []);
  useEffect(() => {
    if (!current) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [current, scale]);

  return (
    <View style={{ height: NODE_ROW_H }}>
      <PathCurve width={width} pos={pos} line={line} />

      {current && (
        <Animated.View
          className="absolute size-24 rounded-full bg-primary/15"
          style={{ left: x - 48, top: NODE_CY - 48, transform: [{ scale }] }}
        />
      )}

      <Pressable
        onPress={onPress}
        className={`absolute h-[72px] w-[72px] items-center justify-center rounded-full active:opacity-80 ${CIRCLE[state]}`}
        style={{ left: x - NODE / 2, top: NODE_CY - NODE / 2 }}
      >
        <MaterialCommunityIcons name={ICON[kind]} size={30} color={ICON_COLOR[state]} />
        {state === "completed" && (
          <View className="absolute -bottom-0.5 -right-0.5 size-6 items-center justify-center rounded-full border-[3px] border-background bg-success">
            <MaterialCommunityIcons name="check-bold" size={11} color={colors.onPrimary} />
          </View>
        )}
      </Pressable>

      <View className="absolute items-center" style={{ left: x - LABEL_W / 2, top: NODE_CY + NODE / 2 + 6, width: LABEL_W }}>
        <Text
          numberOfLines={2}
          className={`text-center text-[13px] leading-4 ${
            current ? "font-bold text-foreground" : state === "upcoming" ? "text-muted" : "font-semibold text-foreground"
          }`}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text numberOfLines={1} className="mt-0.5 text-center text-[11px] text-muted">
            {sublabel}
          </Text>
        ) : current ? (
          <View className="mt-1 rounded-full bg-primary px-2.5 py-0.5">
            <Text className="text-[11px] font-semibold text-onPrimary">Devam et</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

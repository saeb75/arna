import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { LessonKind } from "@glotmate/contracts";
import { NODE_ROW_H, type NodeSide, type NodeState } from "../../lib/lessonPath";
import colors from "../../../colors";

type Glyph = ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Ders tipi → glif. Ekranda "phrases/grammar" gibi iç terim YAZMAZ, yalnız ikon konuşur. */
const ICON: Record<LessonKind | "test", Glyph> = {
  phrases: "presentation",
  grammar: "alphabetical-variant",
  practice: "dumbbell",
  test: "trophy",
};

/** Zikzak kayması — inline style yerine className (CLAUDE.md: StyleSheet/inline stil yok) */
const SIDE_CLASS: Record<NodeSide, string> = {
  [-1]: "-translate-x-12",
  [0]: "",
  [1]: "translate-x-12",
};

const CIRCLE: Record<NodeState, string> = {
  completed: "bg-primary/20",
  current: "bg-primary",
  // Sınav açık ama henüz geçilmedi: dolu mor DEĞİL, çerçeveli — "şu an buradasın"
  // ile "burası seni bekliyor" bir örnek görünmemeli.
  ready: "border-2 border-primary bg-primary/25",
  upcoming: "bg-nodeIdle",
};

/** İkon rengi NativeWind sınıfı alamaz — paletten okunur (hex kopyası yok). */
const ICON_COLOR: Record<NodeState, string> = {
  completed: colors.primary,
  current: colors.onPrimary,
  ready: colors.primary,
  upcoming: colors.muted,
};

/** Başlık, düğümün durumuyla birlikte öne çıkar ya da geri çekilir. */
const LABEL: Record<NodeState, string> = {
  completed: "text-foreground/70",
  current: "font-semibold text-foreground",
  ready: "font-semibold text-foreground",
  upcoming: "text-muted",
};

interface PathNodeProps {
  kind: LessonKind | "test";
  /** Düğümün altında görünen ad — ders başlığı (kanonik İngilizce) ya da ünite testi */
  label: string;
  state: NodeState;
  side: NodeSide;
  onPress: () => void;
}

/**
 * Yolun tek dairesi. Hâlo, ek bağımlılık (expo-blur) olmadan iç içe iki saydam
 * daireyle yapılıyor; başlanmamış düğümde hâlo yok.
 */
export function PathNode({ kind, label, state, side, onPress }: PathNodeProps) {
  const glow = state !== "upcoming";
  return (
    // Yükseklik lib'den: FlatList getItemLayout ile BİREBİR aynı olmak zorunda,
    // className'e kopyalanırsa sessizce ayrışır ve kaydırma kayar. Başlık bu
    // yüzden EN FAZLA iki satır — taşan başlık satır yüksekliğini bozar.
    <View className="items-center justify-center" style={{ height: NODE_ROW_H }}>
      <Pressable onPress={onPress} className={`items-center gap-2 active:opacity-80 ${SIDE_CLASS[side]}`}>
        <View className="items-center justify-center">
          {glow && (
            <>
              <View className="absolute size-40 rounded-full bg-primary/5" />
              <View className="absolute size-28 rounded-full bg-primary/10" />
            </>
          )}
          <View className={`size-24 items-center justify-center rounded-full ${CIRCLE[state]}`}>
            <MaterialCommunityIcons name={ICON[kind]} size={38} color={ICON_COLOR[state]} />
          </View>
          {state === "completed" && (
            <View className="absolute -bottom-1 -right-1 size-9 items-center justify-center rounded-full border-4 border-background bg-success">
              <MaterialCommunityIcons name="check-bold" size={15} color={colors.onPrimary} />
            </View>
          )}
        </View>

        <Text numberOfLines={2} className={`max-w-[160px] text-center text-[13px] leading-4 ${LABEL[state]}`}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

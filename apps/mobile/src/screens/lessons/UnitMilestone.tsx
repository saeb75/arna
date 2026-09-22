import { Text, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NODE_CY, NODE_ROW_H, type PathPos, type SpineLine } from "../../lib/lessonPath";
import colors from "../../../colors";
import { PathCurve, laneX } from "./PathCurve";

/** İşaret çapı (pt) — size-14 ile aynı */
const MARK = 56;
const GAP = 12;
const EDGE = 16;

interface UnitMilestoneProps {
  unitIndex: number;
  /** Katalog başlığı — kanonik İngilizce */
  title: string;
  /** Can-do cümlesi: ünite bitince öğrencinin yapabildiği şey */
  goal: string;
  done: number;
  total: number;
  line: SpineLine;
  pos: PathPos;
}

/**
 * Üniteyi açan kilometre taşı — yolun ÜSTÜNDE bayraklı bir işaret, yanında
 * (yolun boş kalan tarafında) başlık + hedef balonu. Yol kopmaz, eğri işaretin
 * içinden geçer. Yükseklik lib'den, getItemLayout ile bit-uyumlu.
 */
export function UnitMilestone({ unitIndex, title, goal, done, total, line, pos }: UnitMilestoneProps) {
  const { width } = useWindowDimensions();
  const x = laneX(pos.lane, width);
  const complete = done >= total;
  // Balon işaretin TERS tarafında: işaret solda → balon sağda, ve tersi (çalışma zamanı değeri)
  const bubble =
    pos.lane <= 0
      ? { left: x + MARK / 2 + GAP, right: EDGE }
      : { left: EDGE, right: width - x + MARK / 2 + GAP };

  return (
    <View style={{ height: NODE_ROW_H }}>
      <PathCurve width={width} pos={pos} line={line} />

      <View
        className={`absolute size-14 items-center justify-center rounded-full border-[3px] ${
          complete ? "border-primary bg-primary" : "border-primary bg-card"
        }`}
        style={{ left: x - MARK / 2, top: NODE_CY - MARK / 2 }}
      >
        <MaterialCommunityIcons name="flag-variant" size={26} color={complete ? colors.onPrimary : colors.primary} />
      </View>

      <View
        className="absolute justify-center rounded-2xl border border-border bg-card px-3 py-2"
        style={{ ...bubble, top: NODE_CY - 46, height: 92 }}
      >
        <Text className={`text-[11px] font-semibold uppercase tracking-wider ${complete ? "text-success" : "text-muted"}`}>
          Ünite {unitIndex} · {done}/{total}
          {complete ? " ✓" : ""}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-[15px] font-bold text-foreground">
          {title}
        </Text>
        <Text numberOfLines={2} className="mt-0.5 text-xs leading-4 text-muted">
          {goal}
        </Text>
      </View>
    </View>
  );
}

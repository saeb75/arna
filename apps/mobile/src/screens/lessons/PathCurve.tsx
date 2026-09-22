import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { NODE_CY, NODE_ROW_H, type LineState, type PathPos, type SpineLine } from "../../lib/lessonPath";
import colors from "../../../colors";

/** Şeridin ekran genişliğine oranla yatay konumu: orta ± %26 */
export const LANE_AMPLITUDE = 0.26;
export function laneX(lane: number, width: number): number {
  return width / 2 + lane * LANE_AMPLITUDE * width;
}

interface PathCurveProps {
  width: number;
  pos: PathPos;
  line: SpineLine;
}

/**
 * Bir satırın eğri parçaları. Her satır, komşusuna giden eğrinin TAMAMINI kendi
 * koordinatında çizer; SVG görünüm alanı satırla sınırlı olduğundan yalnız
 * kendi payı görünür. Komşu satır aynı eğriyi kendi payıyla çizer → ek yok,
 * bölme matematiği yok. Tüm düğüm satırları aynı yükseklikte ve düğüm merkezi
 * aynı NODE_CY'de olduğu için komşu düğüm hep (x, NODE_CY ± NODE_ROW_H)'dedir.
 * Uçlarda dikey teğet (kontrol noktaları dikey) → düğüme dik giren S-eğrisi.
 */
export function PathCurve({ width, pos, line }: PathCurveProps) {
  const x = laneX(pos.lane, width);
  const half = NODE_ROW_H / 2;

  const segment = (fromX: number, fromY: number, toX: number, toY: number) =>
    `M ${fromX} ${fromY} C ${fromX} ${fromY + half}, ${toX} ${toY - half}, ${toX} ${toY}`;

  const stroke = (state: LineState) =>
    state === "done"
      ? { stroke: colors.primary, strokeDasharray: undefined }
      : { stroke: colors.track, strokeDasharray: "1 12" };

  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Svg width={width} height={NODE_ROW_H}>
        {pos.prev !== null && line.above !== "none" && (
          <Path
            d={segment(laneX(pos.prev, width), NODE_CY - NODE_ROW_H, x, NODE_CY)}
            fill="none"
            strokeWidth={5}
            strokeLinecap="round"
            {...stroke(line.above)}
          />
        )}
        {pos.next !== null && line.below !== "none" && (
          <Path
            d={segment(x, NODE_CY, laneX(pos.next, width), NODE_CY + NODE_ROW_H)}
            fill="none"
            strokeWidth={5}
            strokeLinecap="round"
            {...stroke(line.below)}
          />
        )}
      </Svg>
    </View>
  );
}

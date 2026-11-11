import { useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { rowHeight, trackGeometry, type NodeRect, type PathStop, type TrackRow } from "../../lib/lessonPath";
import { useThemeColors } from "../../theme/useThemeColors";
import { LessonStop } from "./LessonStop";
import { TestStop } from "./TestStop";

const ROAD_W = 16;

/**
 * Kıvrımlı yolun bir SIRASI: yol parçası (SVG) + bu sıradaki 1–2 durak.
 * Geometri saf fonksiyondan (`trackGeometry`) — yolun kalıbı burada değil
 * orada tanımlı. Yükseklik lib'den (getItemLayout ile BİREBİR).
 */
export function PathTrack({ row, onPress }: { row: TrackRow; onPress: (stop: PathStop, rect: NodeRect) => void }) {
  const { width } = useWindowDimensions();
  const colors = useThemeColors();
  const geo = useMemo(() => trackGeometry(row, width), [row, width]);
  const height = rowHeight(row);

  return (
    <View style={{ height }}>
      <View pointerEvents="none" className="absolute inset-0">
        <Svg width={width} height={height}>
          <Path d={geo.road} stroke={colors["path-road"]} strokeWidth={ROAD_W} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {geo.done ? (
            <Path d={geo.done} stroke={colors["path-road-done"]} strokeWidth={ROAD_W} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : null}
        </Svg>
      </View>
      {row.stops.map((stop, i) =>
        stop.kind === "test" ? (
          <TestStop key={stop.key} stop={stop} x={geo.xs[i]!} onPress={onPress} />
        ) : (
          <LessonStop key={stop.key} stop={stop} x={geo.xs[i]!} labelWidth={geo.labelWidth} onPress={onPress} />
        ),
      )}
    </View>
  );
}


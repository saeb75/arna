import { useMemo } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ChevronRight } from "lucide-react-native";
import { tr } from "../../../i18n/tr";
import { JOURNEY_CARD_RIGHT, JOURNEY_COLS, journeyLink, journeyRowHeight, type JourneyRow } from "../../../lib/journeyPath";
import { HapticsService } from "../../../services/HapticsService";
import { useThemeColors } from "../../../theme/useThemeColors";
import { CURRENT_NODE_SIZE, JourneyNode, NODE_SIZE } from "./JourneyNode";

const ROAD_W = 14;
const CARD_H = 50;

/**
 * Yolculuğun bir satırı: arkada yol parçası (SVG, saf geometri `journeyLink`), önde
 * düğüm + ondan sağa uzanan hap kart (ad, "Ders 3/6 · B1", ok). Kartın tamamı
 * dokunulur ve DOĞRUDAN derse/teste girer. Kaldığın derste kartın üstünde rozet.
 * Yükseklik lib'den (getItemLayout ile BİREBİR).
 */
export function JourneyStop({
  row,
  nextHeight,
  onPress,
}: {
  row: Extract<JourneyRow, { kind: "stop" }>;
  nextHeight: number;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const colors = useThemeColors();
  const height = journeyRowHeight(row);
  const link = useMemo(() => journeyLink(row, width, height, nextHeight), [row, width, height, nextHeight]);
  const { stop } = row;
  const isTest = stop.kind === "test";
  const current = stop.state === "current";
  const node = current ? CURRENT_NODE_SIZE : NODE_SIZE;
  const x = width * JOURNEY_COLS[row.col];
  const cardRight = width * JOURNEY_CARD_RIGHT[row.col];
  const dim = stop.state === "upcoming";

  const title = stop.kind === "lesson" ? stop.lesson.title : tr.home.unitTest(stop.unitIndex);
  const meta =
    stop.kind === "lesson"
      ? tr.journey.lessonMeta(stop.indexInUnit + 1, stop.unitSize, row.level)
      : stop.state === "ready"
        ? tr.home.testReady
        : tr.home.testSub;
  const badge =
    stop.kind === "lesson" && current ? (stop.lesson.status === "in_progress" ? tr.journey.inProgress : tr.journey.upNext) : null;

  return (
    // Satır yüksekliği lib'den — gerekçeli inline stil
    <View className="overflow-visible" style={{ height }}>
      {link ? (
        // Yol sonraki düğüme kadar TEK parça — kutu satırın altına taşar (ölçüler çalışma zamanı)
        <View pointerEvents="none" className="absolute left-0 top-0" style={{ width, height: height + nextHeight }}>
          <Svg width={width} height={height + nextHeight}>
            <Path
              d={link}
              stroke={row.exitDone ? colors["path-road-done"] : colors["path-road"]}
              strokeWidth={ROAD_W}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${meta}`}
        onPress={() => {
          HapticsService.tap();
          onPress();
        }}
        className="absolute active:opacity-80"
        // Konum ekran genişliğinden ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
        style={{ left: x - node / 2, top: (height - node) / 2, width: cardRight - (x - node / 2), height: node }}
      >
        {/* Hap kart: düğümün merkezinden başlar, düğümün arkasında kalır */}
        <View
          className={`absolute flex-row items-center rounded-full border border-border bg-card pr-2.5 shadow-sm shadow-scrim/5 ${dim ? "opacity-90" : ""}`}
          style={{ left: node / 2, right: 0, top: (node - CARD_H) / 2, height: CARD_H, paddingLeft: node / 2 + 10 }}
        >
          <View className="flex-1 gap-0.5 pr-1.5">
            <Text
              numberOfLines={2}
              className={`text-[13px] leading-4 ${current || isTest ? "font-bold" : "font-semibold"} ${dim ? "text-foreground/70" : "text-foreground"}`}
            >
              {title}
            </Text>
            <Text numberOfLines={1} className={`text-[10.5px] ${isTest && stop.state === "ready" ? "text-test-ink" : "text-muted-foreground"}`}>
              {meta}
            </Text>
          </View>
          <View className="size-6 items-center justify-center rounded-full bg-muted">
            <ChevronRight color={colors["muted-foreground"]} size={13} strokeWidth={2.4} />
          </View>
        </View>

        <JourneyNode kind={stop.kind === "lesson" ? stop.lesson.kind : null} state={stop.state} test={isTest} />

        {badge ? (
          <View className="absolute rounded-full bg-brand/15 px-2 py-0.5" style={{ left: node / 2 + 6, top: (node - CARD_H) / 2 - 18 }}>
            <Text className="text-[10px] font-bold text-brand">{badge}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

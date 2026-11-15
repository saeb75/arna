import { useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Trophy } from "lucide-react-native";
import { tr } from "../../../i18n/tr";
import { JOURNEY_CARD_RIGHT, JOURNEY_COLS, journeyLink, journeyRowHeight, type JourneyRow } from "../../../lib/journeyPath";
import { useThemeColors } from "../../../theme/useThemeColors";
import { lessonIcon } from "../../../domain/lessonIcon";
import { JOURNEY_CARD_H, JourneyCard } from "../../../components/shared/JourneyCard";

const ROAD_W = 14;
/** Kartın sol kenarı yolun girdiği noktanın bu kadar solunda (yol kartın arkasında biter) */
const CARD_LEAD = 36;

/**
 * Yolculuğun bir satırı: arkada yol parçası (SVG, saf geometri `journeyLink`), önde hap
 * kart (`JourneyCard`: ad, "Ders 3/6 · B1", ok). Yuvarlak düğüm YOK (13 Kas 2026, kullanıcı
 * kararı) — durum kartın kendisinde: kaldığın ders marka çerçevesi + üstte rozet, bitmiş ders
 * okun yerinde yeşil onay, ünite testi altın çerçeve + kupa. Kartın tamamı dokunulur ve
 * DOĞRUDAN derse/teste girer. Kart iOS 26'da NATIVE Liquid Glass'tır (14 Kas 2026): yol camın
 * arkasından kırılarak görünür. Kartın solunda dersin KONU ikonu (elle seçilmiş tablo).
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
  const x = width * JOURNEY_COLS[row.col];
  const cardRight = width * JOURNEY_CARD_RIGHT[row.col];
  const left = x - CARD_LEAD;
  const Icon = stop.kind === "lesson" ? lessonIcon(stop.lesson.id, stop.lesson.kind) : Trophy;

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

      <JourneyCard
        title={title}
        meta={meta}
        icon={Icon}
        state={stop.state}
        isTest={isTest}
        badge={badge}
        metaHighlight={isTest && stop.state === "ready"}
        onPress={onPress}
        // Konum ekran genişliğinden ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
        style={{ position: "absolute", left, top: (height - JOURNEY_CARD_H) / 2, width: cardRight - left }}
      />
    </View>
  );
}

import { useMemo } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Check, ChevronRight, Trophy } from "lucide-react-native";
import { withAlpha } from "../../../../colors";
import { tr } from "../../../i18n/tr";
import { JOURNEY_CARD_RIGHT, JOURNEY_COLS, journeyLink, journeyRowHeight, type JourneyRow } from "../../../lib/journeyPath";
import { HapticsService } from "../../../services/HapticsService";
import { useThemeColors } from "../../../theme/useThemeColors";
import { GLASS, GlassFill } from "../../../components/ui/GlassFill";
import { lessonIcon } from "../../../domain/lessonIcon";

const ROAD_W = 14;
const CARD_H = 50;
/** Kartın sol kenarı yolun girdiği noktanın bu kadar solunda (yol kartın arkasında biter) */
const CARD_LEAD = 36;

/**
 * Yolculuğun bir satırı: arkada yol parçası (SVG, saf geometri `journeyLink`), önde hap
 * kart (ad, "Ders 3/6 · B1", ok). Yuvarlak düğüm YOK (13 Kas 2026, kullanıcı kararı) —
 * durum kartın kendisinde: kaldığın ders marka çerçevesi + üstte rozet, bitmiş ders okun
 * yerinde yeşil onay, ünite testi altın çerçeve + kupa. Kartın tamamı dokunulur ve
 * DOĞRUDAN derse/teste girer.
 * Kart iOS 26'da NATIVE Liquid Glass'tır (14 Kas 2026, kullanıcı isteği; `expo-glass-effect`
 * kurulu derlemede zaten var → OTA): yol camın arkasından kırılarak görünür, dokunuşta
 * sistemin etkileşimli parlaması. Kaldığın ders marka, ünite testi altın tonlu cam. Cam
 * yoksa (Android, iOS ≤ 18) bugünkü dolu kart.
 * Kartın solunda dersin KONU ikonu (14 Kas 2026, kullanıcı referansı; elle seçilmiş tablo).
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
  const dim = stop.state === "upcoming";
  const done = stop.state === "completed";
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${meta}`}
        onPress={() => {
          HapticsService.tap();
          onPress();
        }}
        className={`absolute flex-row items-center gap-2 rounded-full pl-2.5 pr-2.5 ${
          GLASS
            ? current
              ? "border border-brand/50"
              : ""
            : `border bg-card shadow-sm shadow-scrim/5 active:opacity-80 ${
                current ? "border-brand/60" : isTest ? "border-test-face/70" : "border-border"
              } ${dim && !current ? "opacity-90" : ""}`
        }`}
        // Konum ekran genişliğinden ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
        style={{ left, top: (height - CARD_H) / 2, width: cardRight - left, height: CARD_H }}
      >
        <GlassFill
          radius={CARD_H / 2}
          interactive
          tint={current ? withAlpha(colors.brand, 0.18) : isTest ? withAlpha(colors["test-face"], 0.22) : undefined}
        />
        {/* Konu ikonu kutucuğu (ders başına elle seçilmiş — domain/lessonIcon); test kupa */}
        <View
          className={`size-8 items-center justify-center rounded-[10px] border ${
            current ? "border-brand/30 bg-brand/15" : isTest ? "border-test-face/40 bg-test-face/15" : "border-border bg-muted/60"
          }`}
        >
          <Icon color={current ? colors.brand : isTest ? colors["test-ink"] : colors["muted-foreground"]} size={15} strokeWidth={2.2} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text
            numberOfLines={2}
            className={`text-[13px] leading-4 ${current || isTest ? "font-bold" : "font-semibold"} ${
              current ? "text-brand" : dim ? "text-foreground/70" : "text-foreground"
            }`}
          >
            {title}
          </Text>
          <Text numberOfLines={1} className={`text-[10.5px] ${isTest && stop.state === "ready" ? "text-test-ink" : "text-muted-foreground"}`}>
            {meta}
          </Text>
        </View>
        {done ? (
          <View className="size-6 items-center justify-center rounded-full bg-positive">
            <Check color={colors["on-brand"]} size={13} strokeWidth={3.2} />
          </View>
        ) : (
          <View className={`size-6 items-center justify-center rounded-full ${current ? "bg-brand" : "bg-muted"}`}>
            <ChevronRight color={current ? colors["on-brand"] : colors["muted-foreground"]} size={13} strokeWidth={2.4} />
          </View>
        )}

        {badge ? (
          <View className="absolute left-4 rounded-full bg-brand/15 px-2 py-0.5" style={{ top: -18 }}>
            <Text className="text-[10px] font-bold text-brand">{badge}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

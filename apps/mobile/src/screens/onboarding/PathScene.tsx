import { useState } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Trophy } from "lucide-react-native";
import { JOURNEY_CARD_H, JourneyCard, type JourneyCardState } from "../../components/shared/JourneyCard";
import { lessonIcon } from "../../domain/lessonIcon";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { useLoopStep } from "./useLoopStep";

/** A1'in ilk üç dersi (konu ikonu ana sayfadakiyle aynı) — `tr.onboarding.scenes.pathTitles` sırasıyla birebir */
const LESSONS = [
  { id: "a1-hello-im", kind: "phrases" },
  { id: "a1-am-is-are", kind: "grammar" },
  { id: "a1-are-you-a-student", kind: "grammar" },
] as const;
const UNIT_SIZE = 6;
const ROW_H = 76;
const ROAD_W = 14;
/** Kartın sol kenarı yolun girdiği noktanın bu kadar solunda (ana sayfadaki gibi) */
const CARD_LEAD = 36;
/** Zikzak: sol / sağ sütunda kartın sol kenarı ve genişliği (sahne genişliğinin oranı) */
const COL_LEFT = [0, 0.16] as const;
const CARD_W = 0.84;

/**
 * Tanıtım 3: ana sayfadaki YOLCULUĞUN küçük hâli — yılankavi yol + aynı cam hap kartlar
 * (`JourneyCard`), üç ders ve ünite testi. Kaldığın ders sırayla aşağı iner: geçilen dersler
 * yeşil onay alır, yol arkalarında boyanır. Yuvarlak düğüm yok (ana sayfa kararı).
 */
export function PathScene() {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);
  const titles = tr.onboarding.scenes.pathTitles;
  const count = LESSONS.length + 1;
  const step = useLoopStep(count, 1100);

  const stateOf = (i: number): JourneyCardState => (i < step ? "completed" : i === step ? (i === LESSONS.length ? "ready" : "current") : "upcoming");
  // Yolun girdiği nokta (kartın içinde, ikon kutusunun hizasında)
  const point = (i: number) => ({ x: width * COL_LEFT[i % 2]! + CARD_LEAD, y: i * ROW_H + ROW_H / 2 });

  return (
    // Yükseklik satır sayısından — gerekçeli inline stil
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: count * ROW_H }}>
      {width > 0 ? (
        <>
          <Svg width={width} height={count * ROW_H} style={{ position: "absolute" }}>
            {Array.from({ length: count - 1 }, (_, i) => {
              const a = point(i);
              const b = point(i + 1);
              const bend = ROW_H * 0.55;
              return (
                <Path
                  key={i}
                  d={`M ${a.x} ${a.y} C ${a.x} ${a.y + bend}, ${b.x} ${b.y - bend}, ${b.x} ${b.y}`}
                  stroke={i + 1 <= step ? colors["path-road-done"] : colors["path-road"]}
                  strokeWidth={ROAD_W}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </Svg>
          {Array.from({ length: count }, (_, i) => {
            const lesson = LESSONS[i];
            const state = stateOf(i);
            return (
              <JourneyCard
                key={i}
                title={lesson ? titles[i]! : tr.home.unitTest(1)}
                meta={lesson ? tr.journey.lessonMeta(i + 1, UNIT_SIZE, "A1") : state === "ready" ? tr.home.testReady : tr.home.testSub}
                icon={lesson ? lessonIcon(lesson.id, lesson.kind) : Trophy}
                state={state}
                isTest={!lesson}
                badge={lesson && state === "current" ? tr.journey.upNext : null}
                metaHighlight={!lesson && state === "ready"}
                // Konum sahne genişliğinden ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
                style={{
                  position: "absolute",
                  left: width * COL_LEFT[i % 2]!,
                  top: i * ROW_H + (ROW_H - JOURNEY_CARD_H) / 2,
                  width: width * CARD_W,
                }}
              />
            );
          })}
        </>
      ) : null}
    </View>
  );
}

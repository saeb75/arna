import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { RoleplayListItem } from "@glotmate/contracts";
import { ObjectiveChip } from "../../components/shared/ObjectiveChip";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { enter } from "../../theme/motion";
import { RoleplayCard } from "../../components/shared/RoleplayCard";

/** Karuseldeki kartın genişliği + aralığı (`RoleplayCard large` = 288 pt) */
const STEP = 288 + 12;
/** Kartların kategorisi ve gerçek hedef sayısı — `tr.onboarding.scenes.rpCards` sırasıyla birebir */
const DEMO = [
  { category: "Eating out", objectives: 5 },
  { category: "Travel", objectives: 5 },
  { category: "Work", objectives: 6 },
] as const;
const TICK_MS = 850;
const FIRST_TICK_MS = 700;
const HOLD_MS = 1300;

/**
 * Tanıtım 2: Rol Yap sekmesinin GERÇEK kartları (`RoleplayCard large`) yavaşça kayan bir karusel;
 * öndeki kartın hedefleri altında, oyun ekranındaki çiplerle (`ObjectiveChip`) tek tek tiklenir,
 * sonra sıradaki karta geçilir. Karakteri uygulamadaki gibi öğretmen kendi adıyla oynar.
 * Son karttan sonra ilk kartın kopyasına kayar ve görünmeden başa sarar (kesintisiz döngü).
 * Hareketi Azalt: ilk kart, hedefleri tikli, hareketsiz.
 */
export function RoleplayScene() {
  const reduceMotion = useReducedMotion();
  const tutorName = useDraftTutorName();
  const cards = tr.onboarding.scenes.rpCards;
  const [card, setCard] = useState(0);
  const [ticks, setTicks] = useState(0);
  const x = useSharedValue(0);

  const items = useMemo<RoleplayListItem[]>(
    () =>
      [...cards, cards[0]].map((c, i) => {
        const demo = DEMO[i % DEMO.length]!;
        return {
          slug: `intro-${i}`,
          title: c.title,
          category: demo.category,
          scene: "",
          personaName: tutorName,
          recommendedFrom: "A1",
          objectiveCount: demo.objectives,
          willPlayAt: "A1",
          raised: false,
          lastAttempt: null,
        };
      }),
    [cards, tutorName],
  );
  const goals = cards[card % cards.length]!.goals;
  // Hareketi Azalt: hedefler baştan tikli
  const shownTicks = reduceMotion ? goals.length : ticks;
  // Sıradaki karta geçiş: tikler sıfırdan başlar (efektin içinde eşzamanlı setState yok)
  const advance = useCallback((next: number) => {
    setTicks(0);
    setCard(next);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const timers = goals.map((_, i) => setTimeout(() => setTicks(i + 1), FIRST_TICK_MS + i * TICK_MS));
    timers.push(
      setTimeout(() => {
        const next = card + 1;
        x.value = withTiming(-next * STEP, { duration: 560, easing: Easing.inOut(Easing.cubic) }, (done) => {
          if (!done) return;
          // Kopya karta varıldı → görünmeden gerçek ilk karta sar
          if (next >= cards.length) x.value = 0;
          scheduleOnRN(advance, next % cards.length);
        });
      }, FIRST_TICK_MS + goals.length * TICK_MS + HOLD_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [card, reduceMotion, goals, cards.length, x, advance]);

  // Kaydırma animasyonlu stil — sınıfla ifade edilemez
  const strip = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View>
      {/* Kartlar süs — dokunuş yok; şerit sayfanın sağından taşar, ekran kırpar */}
      <Animated.View pointerEvents="none" className="flex-row gap-3" style={strip}>
        {items.map((item) => (
          <RoleplayCard key={item.slug} item={item} large onPress={() => {}} />
        ))}
      </Animated.View>
      <View key={card} className="mt-5 min-h-[124px] gap-2">
        {goals.map((goal, i) => (
          <Animated.View key={goal} entering={enter(i)} className="self-start">
            <ObjectiveChip label={goal} done={shownTicks > i} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

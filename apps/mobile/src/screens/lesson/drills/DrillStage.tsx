import { useMemo } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { currentDrill, drillSequence, type DrillItem } from "@glotmate/contracts";
import { DrillCard } from "../../../components/shared/drills/DrillCard";
import { DrillHostProvider, type DrillHostValue } from "../../../components/shared/drills/DrillHost";
import { LessonDrillController } from "../../../controllers/LessonDrillController";
import { drillItemKey } from "../../../domain/drills";
import { tr } from "../../../i18n/tr";
import { useLessonSessionStore } from "../../../stores/useLessonSessionStore";
import { HintCard } from "../HintCard";
import { DrillSummary } from "./DrillSummary";

/**
 * OYUN BLOĞU SAHNESİ — ders ekranında sohbet akışı + rıhtımın yerini alır.
 * Yalnız store'dan okur; madde yönergesi türe göre sabit metindir (i18n), içerik
 * İngilizcedir. Akış kararı burada YOK (LessonDrillController + contracts).
 */
export function DrillStage({ items }: { items: DrillItem[] }) {
  const drill = useLessonSessionStore((s) => s.drill);
  const verdict = useLessonSessionStore((s) => s.drillVerdict);
  const summary = useLessonSessionStore((s) => s.drillSummary);
  const hint = useLessonSessionStore((s) => s.hint);
  const speaking = useLessonSessionStore((s) => s.speaking);
  const translation = useLessonSessionStore((s) => s.drillTranslation);
  const recording = useLessonSessionStore((s) => s.recording);
  const busy = useLessonSessionStore((s) => s.busy);
  const heard = useLessonSessionStore((s) => s.drillHeard);
  const attempts = useLessonSessionStore((s) => s.drillSpeakAttempts);

  // Derste oyun maddesinin G/Ç'si LessonDrillController'dadır (ses, çeviri, konuşma kartı)
  const host = useMemo<DrillHostValue>(
    () => ({
      play: (text) => LessonDrillController.play(text),
      speaking,
      check: (answer) => LessonDrillController.check(answer),
      next: () => LessonDrillController.next(),
      continueLabel: tr.drill.continue,
      translate: (text) => void LessonDrillController.translate(text),
      translation,
      recall: () => LessonDrillController.recall(),
      speech: {
        recording,
        busy,
        heard,
        attempts,
        press: () => void LessonDrillController.pressSpeak(),
        release: () => void LessonDrillController.releaseSpeak(),
        cantSpeak: () => LessonDrillController.cantSpeak(),
      },
    }),
    [speaking, translation, recording, busy, heard, attempts],
  );

  if (summary) return <DrillSummary ok={summary.ok} total={summary.total} />;
  if (!drill) return null;
  const item = currentDrill(items, drill);
  if (!item) return null;

  const key = drillItemKey(item, drill);
  const total = drillSequence(items, drill).length;
  const isRetry = drill.cursor >= items.length;

  return (
    <View className="flex-1">
      <Animated.View key={`h${key}`} entering={FadeInDown.duration(300)} className="gap-1 px-5 pb-3">
        <Text className="text-xs font-bold tracking-widest text-brand">
          {isRetry ? tr.drill.retryEyebrow : tr.drill.eyebrow(drill.cursor + 1, total)}
        </Text>
        <Text className="text-xl font-bold tracking-tight text-foreground">{tr.drill.instruction[item.type]}</Text>
      </Animated.View>

      {hint && (
        <Animated.View entering={FadeIn.duration(200)}>
          <HintCard hint={hint} label={tr.drill.recall} />
        </Animated.View>
      )}

      <DrillHostProvider value={host}>
        <DrillCard key={key} item={item} itemKey={key} verdictOk={verdict && verdict.itemKey === key ? verdict.ok : null} />
      </DrillHostProvider>
    </View>
  );
}

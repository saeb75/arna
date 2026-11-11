import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { drillTilePool, type DrillAnswer, type DrillItem } from "@glotmate/contracts";
import { CtaButton } from "../../ui/CtaButton";
import { drillCorrectText } from "../../../domain/drills";
import { tr } from "../../../i18n/tr";
import { CompleteChatDrill } from "./CompleteChatDrill";
import { DrillFeedback } from "./DrillFeedback";
import { FillChoiceDrill } from "./FillChoiceDrill";
import { FindErrorDrill } from "./FindErrorDrill";
import { ListenChooseDrill } from "./ListenChooseDrill";
import { MatchDrill } from "./MatchDrill";
import { useDrillHost } from "./DrillHost";
import { shuffledOrder } from "./shuffle";
import { SituationDrill } from "./SituationDrill";
import { SpeakDrill } from "./SpeakDrill";
import { TileDrill } from "./TileDrill";

interface Props {
  item: DrillItem;
  /** Madde + konum — tekrar turunda yeni anahtar, yerel durum sıfırlanır */
  itemKey: string;
  /** Kontrol edildiyse sonucu (null = henüz kontrol edilmedi) */
  verdictOk: boolean | null;
}

/**
 * TEK MADDE — seçim/kart/dokunuş YEREL görünüm durumudur (CheckpointScreen deseni:
 * kaçıncı şık seçildi, hangi kartlar dizildi). Karar, puan ve sıra controller'da
 * (contracts drillGrade). Ana eylem tek: Kontrol et → Devam.
 */
export function DrillCard({ item, itemKey, verdictOk }: Props) {
  const host = useDrillHost();
  const checked = verdictOk !== null;
  const [choice, setChoice] = useState<number | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [tap, setTap] = useState<number | null>(null);
  // Kartlar madde başına BİR kez karışır (sunum; puan metin üzerinden)
  const tiles = useMemo(() => {
    if (item.type !== "arrange" && item.type !== "listen_arrange") return [];
    const pool = drillTilePool(item);
    return shuffledOrder(pool.length).map((i) => pool[i]!);
  }, [item]);

  const answer = useMemo<DrillAnswer | null>(() => {
    switch (item.type) {
      case "fill_choice":
      case "situation":
      case "complete_chat":
      case "listen_choose":
        return choice === null ? null : { kind: "choice", index: choice };
      case "arrange":
      case "listen_arrange":
        return built.length ? { kind: "tokens", tokens: built.map((i) => tiles[i]!) } : null;
      case "find_error":
        return tap === null ? null : { kind: "tap", index: tap };
      case "match":
      case "speak":
        return null; // eşleştirme kendiliğinden, konuşma kartı mikrofonla kapanır
    }
  }, [item, choice, built, tap, tiles]);

  const { check } = host;
  const onMatchDone = useCallback((mistakes: number) => check({ kind: "match", mistakes }), [check]);
  const choiceProps = { itemKey, choice, checked, onChoose: setChoice };

  const body = (() => {
    switch (item.type) {
      case "fill_choice":
        return <FillChoiceDrill item={item} {...choiceProps} />;
      case "situation":
        return <SituationDrill item={item} {...choiceProps} />;
      case "complete_chat":
        return <CompleteChatDrill item={item} {...choiceProps} />;
      case "listen_choose":
        return <ListenChooseDrill item={item} {...choiceProps} />;
      case "arrange":
      case "listen_arrange":
        return <TileDrill item={item} tiles={tiles} built={built} checked={checked} verdictOk={verdictOk} onChange={setBuilt} />;
      case "find_error":
        return <FindErrorDrill item={item} tap={tap} checked={checked} onTap={setTap} />;
      case "match":
        return <MatchDrill item={item} checked={checked} onDone={onMatchDone} />;
      case "speak":
        return <SpeakDrill item={item} checked={checked} />;
    }
  })();

  // Konuşma kartı ve eşleştirme "Kontrol et" istemez — kendi eylemleriyle kapanır
  const showCheck = !checked && item.type !== "speak" && item.type !== "match";

  return (
    <View className="flex-1">
      {/* grow: içerik kısa olduğunda gövde kalan alanı doldurur (konuşma kartında mikrofon ortalanır) */}
      <ScrollView className="flex-1" contentContainerClassName="grow gap-5 px-5 pb-4 pt-2" keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(60).duration(380)} className="grow">
          {body}
        </Animated.View>
      </ScrollView>

      <View className="gap-3 px-4 pb-1">
        {verdictOk !== null && (
          <DrillFeedback
            ok={verdictOk}
            correctText={drillCorrectText(item)}
            note={verdictOk ? null : (host.feedbackFor?.(choice) ?? null)}
            onRecall={host.recall}
          />
        )}
        {checked && <CtaButton label={host.continueLabel} onPress={host.next} />}
        {showCheck && (
          <CtaButton label={tr.drill.check} disabled={!answer} onPress={() => answer && check(answer)} />
        )}
      </View>
    </View>
  );
}

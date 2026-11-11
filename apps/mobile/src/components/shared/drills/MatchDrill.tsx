import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { matchPairOk, type DrillOf } from "@glotmate/contracts";
import { HapticsService } from "../../../services/HapticsService";
import { shuffledOrder } from "./shuffle";

interface Props {
  item: DrillOf<"match">;
  checked: boolean;
  /** Bütün çiftler bulununca bir kez — kaç hatalı deneme yapıldı */
  onDone: (mistakes: number) => void;
}

/** Eşleştirmede yanlış çiftin kırmızı kalma süresi */
const WRONG_FLASH_MS = 450;

/**
 * Eşleştir — iki sütun, sol ve sağdan birer kart seçilir. Doğru çift soluklaşıp
 * kilitlenir, yanlış çift kısa süre kırmızı yanar. Görünüm durumu yereldir
 * (CheckpointScreen deseni); karar `matchPairOk` (contracts).
 */
export function MatchDrill({ item, checked, onDone }: Props) {
  const [rightOrder] = useState(() => shuffledOrder(item.pairs.length));
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const mistakes = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Madde ekrandan kalkarsa yanıp sönme zamanlayıcısı sahipsiz kalmasın
  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  /** Seçim olay anında değerlendirilir (effect içinde setState yok) */
  const pick = (side: "left" | "right", idx: number) => {
    HapticsService.tap();
    const l = side === "left" ? idx : left;
    const r = side === "right" ? idx : right;
    if (l === null || r === null) {
      if (side === "left") setLeft(idx);
      else setRight(idx);
      return;
    }
    if (matchPairOk(item, l, item.pairs[r]!.right)) {
      HapticsService.selection();
      const next = [...matched, l];
      setMatched(next);
      setLeft(null);
      setRight(null);
      if (next.length === item.pairs.length) onDone(mistakes.current);
      return;
    }
    mistakes.current += 1;
    HapticsService.warning();
    setLeft(l);
    setRight(r);
    setWrong([l, r]);
    flashTimer.current = setTimeout(() => {
      setWrong(null);
      setLeft(null);
      setRight(null);
    }, WRONG_FLASH_MS);
  };

  const cell = (isMatched: boolean, isSel: boolean, isWrong: boolean) =>
    isWrong
      ? "border-negative bg-negative/10"
      : isMatched
        ? "border-positive/40 bg-positive/10 opacity-50"
        : isSel
          ? "border-brand bg-brand/10"
          : "border-border bg-card";

  return (
    <View className="flex-row gap-3">
      <View className="flex-1 gap-2.5">
        {item.pairs.map((p, i) => {
          const isMatched = matched.includes(i);
          return (
            <Pressable
              key={`l${i}`}
              disabled={checked || isMatched || wrong !== null}
              onPress={() => pick("left", i)}
              className={`min-h-14 justify-center rounded-2xl border-2 px-3 py-2.5 active:opacity-80 ${cell(isMatched, left === i, wrong?.[0] === i)}`}
            >
              <Text className="text-center text-base font-semibold text-foreground">{p.left}</Text>
            </Pressable>
          );
        })}
      </View>
      <View className="flex-1 gap-2.5">
        {rightOrder.map((pairIdx) => {
          const isMatched = matched.includes(pairIdx);
          return (
            <Pressable
              key={`r${pairIdx}`}
              disabled={checked || isMatched || wrong !== null}
              onPress={() => pick("right", pairIdx)}
              className={`min-h-14 justify-center rounded-2xl border-2 px-3 py-2.5 active:opacity-80 ${cell(isMatched, right === pairIdx, wrong?.[1] === pairIdx)}`}
            >
              <Text className="text-center text-base font-semibold text-foreground">{item.pairs[pairIdx]!.right}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

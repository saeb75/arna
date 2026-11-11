import { Text, View } from "react-native";
import type { DrillOf } from "@glotmate/contracts";
import { ChoiceList } from "../ChoiceList";
import { TapToTranslate } from "./TapToTranslate";

interface Props {
  item: DrillOf<"situation">;
  itemKey: string;
  choice: number | null;
  checked: boolean;
  onChoose: (i: number) => void;
}

/** Durumu oku, doğru kalıbı seç — bağlam kartı + şıklar */
export function SituationDrill({ item, itemKey, choice, checked, onChoose }: Props) {
  return (
    <View className="gap-6">
      <View className="gap-3 rounded-3xl border border-border bg-card p-4">
        <Text className="text-xl font-semibold leading-7 text-foreground">{item.context}</Text>
        <TapToTranslate text={item.context} />
      </View>
      <ChoiceList itemKey={itemKey} options={item.options} correctIndex={item.correctIndex} choice={choice} checked={checked} onChoose={onChoose} />
    </View>
  );
}

import { View } from "react-native";
import type { DrillOf } from "@glotmate/contracts";
import { ChoiceList } from "../ChoiceList";
import { ListenButton } from "./ListenButton";

interface Props {
  item: DrillOf<"listen_choose">;
  itemKey: string;
  choice: number | null;
  checked: boolean;
  onChoose: (i: number) => void;
}

/** Duyduğunu seç — ses kendiliğinden çalar (controller), kart yeniden çaldırır */
export function ListenChooseDrill({ item, itemKey, choice, checked, onChoose }: Props) {
  return (
    <View className="gap-6">
      <ListenButton text={item.audio} />
      <ChoiceList itemKey={itemKey} options={item.options} correctIndex={item.correctIndex} choice={choice} checked={checked} onChoose={onChoose} />
    </View>
  );
}

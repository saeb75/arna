import { Text, View } from "react-native";
import type { DrillOf } from "@glotmate/contracts";
import { ChoiceList } from "../ChoiceList";
import { TapToTranslate } from "./TapToTranslate";

interface Props {
  item: DrillOf<"fill_choice">;
  itemKey: string;
  choice: number | null;
  checked: boolean;
  onChoose: (i: number) => void;
}

/** Boşluğu doldur — seçilen şık cümlenin içinde boşluğa oturur */
export function FillChoiceDrill({ item, itemKey, choice, checked, onChoose }: Props) {
  const [before, after = ""] = item.sentence.split("___");
  const filled = choice === null ? "_____" : item.options[choice];
  return (
    <View className="gap-6">
      <View className="gap-3">
        <Text className="text-2xl font-bold leading-9 tracking-tight text-foreground">
          {before}
          <Text className={choice === null ? "text-muted-foreground" : "text-brand underline"}>{filled}</Text>
          {after}
        </Text>
        <TapToTranslate text={item.sentence.replace("___", "...")} />
      </View>
      <ChoiceList itemKey={itemKey} options={item.options} correctIndex={item.correctIndex} choice={choice} checked={checked} onChoose={onChoose} />
    </View>
  );
}

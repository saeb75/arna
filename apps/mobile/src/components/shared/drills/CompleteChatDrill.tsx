import { View } from "react-native";
import type { DrillOf } from "@glotmate/contracts";
import { ChoiceList } from "../ChoiceList";
import { ChatLine } from "./ChatLine";

interface Props {
  item: DrillOf<"complete_chat">;
  itemKey: string;
  choice: number | null;
  checked: boolean;
  onChoose: (i: number) => void;
}

/** Sohbeti tamamla — kısa diyalog, öğrencinin satırı şıklardan */
export function CompleteChatDrill({ item, itemKey, choice, checked, onChoose }: Props) {
  const filled = choice === null ? null : (item.options[choice] ?? null);
  return (
    <View className="gap-6">
      <View className="gap-3">
        {item.lines.map((line, i) => (
          <ChatLine key={i} index={i} who={line.who} text={line.text} filled={filled} />
        ))}
      </View>
      <ChoiceList itemKey={itemKey} options={item.options} correctIndex={item.correctIndex} choice={choice} checked={checked} onChoose={onChoose} />
    </View>
  );
}

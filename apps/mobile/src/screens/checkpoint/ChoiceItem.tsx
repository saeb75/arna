import { Pressable, Text, View } from "react-native";
import type { CheckpointItem } from "@arna/contracts";

interface ChoiceItemProps {
  /** `mcq` ya da `gap` — ikisi de tek doğru cevaplı şık listesi */
  item: Extract<CheckpointItem, { kind: "mcq" | "gap" }>;
  choice: number | null;
  checked: boolean;
  onChoose: (index: number) => void;
}

/** Şıklar butondur (web'de öğrenilen kural: tek harf/kısa cevap yazdırılmaz). */
export function ChoiceItem({ item, choice, checked, onChoose }: ChoiceItemProps) {
  return (
    <View className="gap-5">
      <Text className="text-xl leading-relaxed text-white">{item.prompt}</Text>
      <View className="gap-2">
        {item.options.map((option, i) => {
          const picked = choice === i;
          const showRight = checked && i === item.correctIndex;
          const showWrong = checked && picked && i !== item.correctIndex;
          const style = showRight
            ? "border-success bg-success/10"
            : showWrong
              ? "border-red-500 bg-red-500/10"
              : picked
                ? "border-primary bg-primary/10"
                : "border-muted/25";
          return (
            <Pressable
              key={i}
              disabled={checked}
              onPress={() => onChoose(i)}
              className={`rounded-xl border-2 px-4 py-3.5 active:opacity-80 ${style}`}
            >
              <Text className="text-[15px] text-white">{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import type { CheckpointItem } from "@glotmate/contracts";
import { OptionCard } from "../../components/ui/OptionCard";
import { enter } from "../../theme/motion";

interface ChoiceItemProps {
  /** `mcq` ya da `gap` — ikisi de tek doğru cevaplı şık listesi */
  item: Extract<CheckpointItem, { kind: "mcq" | "gap" }>;
  choice: number | null;
  checked: boolean;
  onChoose: (index: number) => void;
}

/** Şıklar butondur (tek harf/kısa cevap yazdırılmaz). Kontrolden sonra doğru yeşil, yanlış seçim kırmızı. */
export function ChoiceItem({ item, choice, checked, onChoose }: ChoiceItemProps) {
  return (
    <View className="gap-5">
      <Text className="text-2xl font-bold leading-snug tracking-tight text-foreground">{item.prompt}</Text>
      <View className="gap-2.5">
        {item.options.map((option, i) => {
          const tone = checked ? (i === item.correctIndex ? "positive" : choice === i ? "negative" : undefined) : undefined;
          return (
            <Animated.View key={`${item.id}-${i}`} entering={enter(i, 0)}>
              <OptionCard title={option} selected={choice === i} tone={tone} disabled={checked} onPress={() => onChoose(i)} />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

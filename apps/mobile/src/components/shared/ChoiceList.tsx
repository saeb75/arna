import { View } from "react-native";
import Animated from "react-native-reanimated";
import { OptionCard } from "../ui/OptionCard";
import { enter } from "../../theme/motion";

interface ChoiceListProps {
  /** Animasyon anahtarı — madde değişince şıklar yeniden girer */
  itemKey: string;
  options: string[];
  correctIndex: number;
  choice: number | null;
  checked: boolean;
  onChoose: (index: number) => void;
}

/**
 * Tek doğru cevaplı şık listesi — ünite testi ve dersteki oyun bloğu ortak dili.
 * Şıklar butondur (tek harf/kısa cevap yazdırılmaz). Kontrolden sonra doğru şık
 * yeşil, yanlış seçim kırmızı.
 */
export function ChoiceList({ itemKey, options, correctIndex, choice, checked, onChoose }: ChoiceListProps) {
  return (
    <View className="gap-2.5">
      {options.map((option, i) => {
        const tone = checked ? (i === correctIndex ? "positive" : choice === i ? "negative" : undefined) : undefined;
        return (
          <Animated.View key={`${itemKey}-${i}`} entering={enter(i, 0)}>
            <OptionCard title={option} selected={choice === i} tone={tone} disabled={checked} onPress={() => onChoose(i)} />
          </Animated.View>
        );
      })}
    </View>
  );
}

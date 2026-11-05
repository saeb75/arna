import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { HapticsService } from "../../services/HapticsService";
import { enter } from "../../theme/motion";

/**
 * MCQ şıkları — ÜRÜN KURALI: tek harf STT için en kötü girdi (canlı hatadan),
 * şıklar butonla. Dokunmak şık METNİNİ normal akışa verir; mikrofon/klavye açık kalır.
 * Görev kartının içinde büyük, dokunsal düğmeler (altta ince kalınlık kenarı).
 */
const LETTERS = ["A", "B", "C", "D"];

export function OptionButtons({
  options,
  disabled,
  onSelect,
  startDelay = 0,
}: {
  options: string[];
  disabled: boolean;
  onSelect: (option: string) => void;
  /** Soru akarak yazılırken şıklar beklesin, akış bitince sırayla gelsin (ms) */
  startDelay?: number;
}) {
  return (
    <View className="gap-2.5">
      {options.map((opt, i) => (
        <Animated.View key={`${i}-${opt}`} entering={enter(i, startDelay)}>
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => {
              HapticsService.tap();
              onSelect(opt);
            }}
            className={`min-h-14 flex-row items-center gap-3.5 rounded-2xl border border-b-4 border-border bg-muted px-4 py-3 active:border-brand active:bg-brand/10 ${disabled ? "opacity-60" : ""}`}
          >
            <View className="size-9 items-center justify-center rounded-xl bg-card">
              <Text className="text-[15px] font-extrabold text-brand">{LETTERS[i]}</Text>
            </View>
            <Text className="flex-1 text-[17px] font-semibold text-foreground">{opt}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

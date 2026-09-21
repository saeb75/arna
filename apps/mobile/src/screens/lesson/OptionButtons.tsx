import { Pressable, Text, View } from "react-native";

/**
 * MCQ şıkları — ÜRÜN KURALI: tek harf STT için en kötü girdi (web'de canlı
 * hatadan öğrenildi), şıklar butonla. Tıklamak şık METNİNİ normal akışa vermek;
 * yeni akış yolu yok. Mikrofon/klavye açık kalır.
 */
const LETTERS = ["A", "B", "C", "D"];

interface OptionButtonsProps {
  options: string[];
  disabled: boolean;
  onSelect: (option: string) => void;
}

export function OptionButtons({ options, disabled, onSelect }: OptionButtonsProps) {
  return (
    <View className="gap-2 px-4 pb-2">
      {options.map((opt, i) => (
        <Pressable
          key={i}
          disabled={disabled}
          onPress={() => onSelect(opt)}
          className={`flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 active:bg-primary/20 ${
            disabled ? "opacity-40" : ""
          }`}
        >
          <View className="size-7 items-center justify-center rounded-full bg-primary/15">
            <Text className="text-sm font-bold text-primary">{LETTERS[i]}</Text>
          </View>
          <Text className="flex-1 text-base text-foreground">{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

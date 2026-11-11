import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { tr } from "../../../i18n/tr";
import { enter } from "../../../theme/motion";

interface Props {
  index: number;
  who: "them" | "you";
  /** null → öğrencinin dolduracağı satır */
  text: string | null;
  /** Boş satıra seçilen şık (yoksa kesik çerçeveli boşluk) */
  filled: string | null;
}

/** Sohbeti tamamla'nın tek satırı — karşı taraf solda, öğrenci sağda */
export function ChatLine({ index, who, text, filled }: Props) {
  const mine = who === "you";
  const blank = text === null;
  const body = blank ? (filled ?? "…") : text;
  const bubble = blank
    ? `border-2 border-dashed ${filled ? "border-brand bg-brand/10" : "border-border bg-card"}`
    : mine
      ? "bg-primary"
      : "border border-border bg-card";
  const textTone = blank ? (filled ? "text-foreground" : "text-muted-foreground") : mine ? "text-primary-foreground" : "text-foreground";
  return (
    <Animated.View entering={enter(index, 0)} className={`max-w-[85%] gap-1 ${mine ? "self-end items-end" : "self-start"}`}>
      <Text className="px-1 text-xs font-semibold text-muted-foreground">{mine ? tr.drill.you : tr.drill.them}</Text>
      <View className={`rounded-2xl px-4 py-2.5 ${bubble}`}>
        <Text className={`text-[17px] leading-6 ${textTone}`}>{body}</Text>
      </View>
    </Animated.View>
  );
}

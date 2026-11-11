import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { TextButton } from "../../ui/TextButton";
import { tr } from "../../../i18n/tr";

interface Props {
  ok: boolean;
  correctText: string;
  /** Seçilen şıkkın açıklaması (testte quiz geri bildirimi) */
  note?: string | null;
  /** "Konuyu hatırla" — yalnız derste */
  onRecall?: () => void;
}

/** Kontrol sonrası panel — doğruysa kutlama, yanlışsa doğrusu + konuya dönüş */
export function DrillFeedback({ ok, correctText, note, onRecall }: Props) {
  return (
    <Animated.View entering={FadeInDown.duration(280)} className={`gap-1 rounded-3xl p-4 ${ok ? "bg-positive/10" : "bg-negative/10"}`}>
      <Text className={`text-base font-bold ${ok ? "text-positive" : "text-negative"}`}>{ok ? tr.drill.correct : tr.drill.answerWas}</Text>
      {!ok && (
        <View className="gap-1">
          <Text className="text-base leading-6 text-foreground">{correctText}</Text>
          {note ? <Text className="text-sm leading-5 text-muted-foreground">{note}</Text> : null}
          {onRecall && <TextButton label={tr.drill.recall} onPress={onRecall} />}
        </View>
      )}
    </Animated.View>
  );
}

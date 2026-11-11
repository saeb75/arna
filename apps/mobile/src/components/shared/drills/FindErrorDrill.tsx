import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { errorSentenceWords, type DrillOf } from "@glotmate/contracts";
import { HapticsService } from "../../../services/HapticsService";
import { enter } from "../../../theme/motion";
import { TapToTranslate } from "./TapToTranslate";

interface Props {
  item: DrillOf<"find_error">;
  tap: number | null;
  checked: boolean;
  onTap: (i: number) => void;
}

/** Hatayı bul — cümlenin kelimeleri dokunulabilir; kontrolden sonra hatalı kelime işaretlenir */
export function FindErrorDrill({ item, tap, checked, onTap }: Props) {
  const words = errorSentenceWords(item);
  return (
    <View className="gap-5">
      <View className="flex-row flex-wrap gap-2">
        {words.map((w, i) => {
          const isWrong = checked && i === item.wrongIndex;
          const picked = tap === i;
          const frame = isWrong
            ? "border-negative bg-negative/10"
            : picked
              ? checked
                ? "border-border bg-card"
                : "border-brand bg-brand/10"
              : "border-border bg-card";
          return (
            <Animated.View key={i} entering={enter(i, 0)}>
              <Pressable
                disabled={checked}
                onPress={() => {
                  HapticsService.selection();
                  onTap(i);
                }}
                className={`rounded-xl border-2 px-3.5 py-2.5 active:opacity-80 ${frame}`}
              >
                <Text className={`text-xl font-semibold ${isWrong ? "text-negative line-through" : "text-foreground"}`}>{w}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      <TapToTranslate text={item.sentence} />
    </View>
  );
}

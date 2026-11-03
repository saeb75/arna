import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import type { CheckpointItem } from "@glotmate/contracts";
import { HapticsService } from "../../services/HapticsService";

interface OrderItemProps {
  item: Extract<CheckpointItem, { kind: "order" }>;
  /** Kurulan cümle — `item.tokens` içindeki indeksler, dizilme sırasıyla */
  built: number[];
  checked: boolean;
  onChange: (built: number[]) => void;
}

/** Cümle sıralama: havuzdan karo alınır, kurulan cümleden dokunarak geri konur. */
export function OrderItem({ item, built, checked, onChange }: OrderItemProps) {
  return (
    <View className="gap-6">
      <View className="min-h-24 flex-row flex-wrap content-start gap-2 rounded-3xl border-2 border-dashed border-border bg-card p-3">
        {built.map((tokenIdx, pos) => (
          <Animated.View key={`${tokenIdx}-${pos}`} entering={FadeIn.duration(180)} layout={LinearTransition.duration(220)}>
            <Pressable
              disabled={checked}
              onPress={() => {
                HapticsService.selection();
                onChange(built.filter((_, i) => i !== pos));
              }}
              className="rounded-xl border-2 border-brand bg-brand/10 px-3.5 py-2 active:opacity-80"
            >
              <Text className="text-base font-semibold text-foreground">{item.tokens[tokenIdx]}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      <View className="flex-row flex-wrap justify-center gap-2">
        {item.tokens.map((token, i) => {
          const used = built.includes(i);
          return (
            <Pressable
              key={i}
              disabled={checked || used}
              onPress={() => {
                HapticsService.selection();
                onChange([...built, i]);
              }}
              className={`rounded-xl border-2 border-border bg-card px-3.5 py-2 active:opacity-80 ${used ? "opacity-25" : ""}`}
            >
              <Text className="text-base font-semibold text-foreground">{token}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

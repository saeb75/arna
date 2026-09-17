import { Pressable, Text, View } from "react-native";
import type { CheckpointItem } from "@glotmate/contracts";

interface OrderItemProps {
  item: Extract<CheckpointItem, { kind: "order" }>;
  /** Kurulan cümle — `item.tokens` içindeki indeksler, dizilme sırasıyla */
  built: number[];
  checked: boolean;
  onChange: (built: number[]) => void;
}

/** Cümle sıralama: havuzdan kutucuk alınır, kurulan cümleden dokunarak geri konur. */
export function OrderItem({ item, built, checked, onChange }: OrderItemProps) {
  return (
    <View className="gap-5">
      <View className="min-h-20 rounded-xl border border-dashed border-muted/40 p-3">
        <View className="flex-row flex-wrap gap-2">
          {built.map((tokenIdx, pos) => (
            <Pressable
              key={`${tokenIdx}-${pos}`}
              disabled={checked}
              onPress={() => onChange(built.filter((_, i) => i !== pos))}
              className="rounded-lg bg-card px-3 py-2 active:opacity-80"
            >
              <Text className="text-[15px] text-white">{item.tokens[tokenIdx]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {item.tokens.map((token, i) =>
          built.includes(i) ? (
            <View key={i} className="rounded-lg bg-card px-3 py-2 opacity-30">
              <Text className="text-[15px] text-white">{token}</Text>
            </View>
          ) : (
            <Pressable
              key={i}
              disabled={checked}
              onPress={() => onChange([...built, i])}
              className="rounded-lg border border-muted/25 bg-card px-3 py-2 active:opacity-80"
            >
              <Text className="text-[15px] text-white">{token}</Text>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

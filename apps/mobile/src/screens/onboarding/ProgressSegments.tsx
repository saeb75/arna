import { View } from "react-native";
import { ProgressSegment } from "./ProgressSegment";

/** Neredesin: sayfa başına bir parça, bu sayfaya kadar dolu. */
export function ProgressSegments({ count, index, color }: { count: number; index: number; color: string }) {
  return (
    <View className="flex-1 flex-row gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <ProgressSegment key={i} on={i <= index} color={color} />
      ))}
    </View>
  );
}

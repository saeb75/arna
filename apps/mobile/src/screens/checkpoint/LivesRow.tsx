import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CHECKPOINT_LIVES } from "@glotmate/contracts";

/**
 * Kalan canlar. Sayı contracts'tan gelir — ekran kendi sabitini TUTMAZ, yoksa
 * kural değiştiğinde gösterge ile gerçek ayrışır.
 */
export function LivesRow({ left }: { left: number }) {
  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: CHECKPOINT_LIVES }, (_, i) => (
        <MaterialCommunityIcons
          key={i}
          name={i < left ? "heart" : "heart-outline"}
          size={19}
          color={i < left ? "#ef4444" : "#3f3f46"}
        />
      ))}
    </View>
  );
}

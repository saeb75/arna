import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ContinueCardProps {
  /** Üst satır bağlamı: "A1 · Hello and Introductions" */
  level: string;
  unitTitle: string;
  lessonTitle: string;
  onPress: () => void;
}

/** Kaldığı yerden devam kartı — ekranın tek birincil eylemi. */
export function ContinueCard({ level, unitTitle, lessonTitle, onPress }: ContinueCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mt-3 flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 active:opacity-80"
    >
      <View className="flex-1">
        <Text className="text-[13px] text-muted" numberOfLines={1}>
          {level} · {unitTitle}
        </Text>
        <Text className="mt-0.5 text-[17px] font-bold text-white" numberOfLines={1}>
          {lessonTitle}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={26} color="#9ca3af" />
    </Pressable>
  );
}

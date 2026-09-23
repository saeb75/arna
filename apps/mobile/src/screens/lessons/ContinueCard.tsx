import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../colors";

interface ContinueCardProps {
  /** Üst ince satır: "B1 · Intermediate" — kaydırmayı izleyen bağlam */
  topLine: string;
  /** Kalın satır: o an bakılan ünitenin adı */
  title: string;
  /** Dokunuş: kaldığın derse geri kaydırır (uzaklaşınca tek dokunuşla dönüş) */
  onPress: () => void;
}

/**
 * Bağlam kartı — liste kaydırıldıkça o an bakılan SEVİYE + ÜNİTEYİ gösterir
 * (Duolingo'nun yapışkan ünite başlığı deseni). Sabit "kaldığın ders" bilgisi
 * değildir; kaldığın yere dönüş, dokunuşun işidir.
 */
export function ContinueCard({ topLine, title, onPress }: ContinueCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mt-3 flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 active:opacity-80"
    >
      <View className="flex-1">
        <Text className="text-[13px] text-muted" numberOfLines={1}>
          {topLine}
        </Text>
        <Text className="mt-0.5 text-[17px] font-bold text-foreground" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={26} color={colors.muted} />
    </Pressable>
  );
}

import { Text, View } from "react-native";
import { UNIT_ROW_H } from "../../lib/lessonPath";

/** Yolu ünitelere bölen ortalanmış etiket. Katalog başlığı kanonik İngilizce'dir. */
export function UnitPill({ title }: { title: string }) {
  return (
    // Yükseklik lib'den — getItemLayout ile aynı kaynak (bkz. PathNode)
    <View className="items-center justify-center" style={{ height: UNIT_ROW_H }}>
      <View className="rounded-full bg-surface px-5 py-2.5">
        <Text className="text-sm font-semibold text-white">{title}</Text>
      </View>
    </View>
  );
}

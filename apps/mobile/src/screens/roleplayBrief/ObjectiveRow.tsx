import { Text, View } from "react-native";

/** Brief'teki hedef satırı: numara rozeti + İngilizce iletişim adımı. */
export function ObjectiveRow({ index, label }: { index: number; label: string }) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl px-2 py-2.5">
      <View className="size-8 items-center justify-center rounded-full bg-brand/15">
        <Text className="text-sm font-extrabold text-brand">{index}</Text>
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">{label}</Text>
    </View>
  );
}

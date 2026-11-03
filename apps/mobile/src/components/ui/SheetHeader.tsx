import { Text, View } from "react-native";

/** Native formSheet'in başlığı — büyük başlık + isteğe bağlı açıklama. */
export function SheetHeader({ title, body }: { title: string; body?: string }) {
  return (
    <View className="gap-1.5 pb-5">
      <Text accessibilityRole="header" className="text-2xl font-extrabold tracking-tight text-foreground">
        {title}
      </Text>
      {body ? <Text className="text-[15px] leading-snug text-muted-foreground">{body}</Text> : null}
    </View>
  );
}

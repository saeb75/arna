import { Text, View } from "react-native";
import { tr } from "../../i18n/tr";

/** "ya da e-posta ile" ayracı */
export function OrDivider() {
  return (
    <View className="flex-row items-center gap-3 py-1">
      <View className="h-px flex-1 bg-border" />
      <Text className="text-xs font-semibold text-muted-foreground">{tr.auth.or}</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}

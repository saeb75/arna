import { Text, View } from "react-native";
import Constants from "expo-constants";
import { tr } from "../../i18n/tr";

/** Alt bilgi: bir cümle + sürüm. */
export function ProfileFooter() {
  const version = Constants.expoConfig?.version ?? "1.0.0";
  return (
    <View className="items-center gap-1 pb-2">
      <Text className="text-xs font-medium text-muted-foreground">{tr.profile.footer}</Text>
      <Text className="text-xs tabular-nums text-muted-foreground">{tr.profile.version(version)}</Text>
    </View>
  );
}

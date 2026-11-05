import { Text, View } from "react-native";
import { StreakPill } from "../../components/shared/StreakPill";
import { tr } from "../../i18n/tr";

/** Ana ekranın üstü: selam + başlık, seri hapı. Yükseklik SABİT 52. (Pro tacı 5 Kas 2026'da kalktı — her şey ücretsiz.) */
export function HomeHeader({ name, streak }: { name: string; streak: number }) {
  return (
    <View className="h-[52px] flex-row items-center gap-2">
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-medium text-muted-foreground">
          {tr.home.greeting(name)}
        </Text>
        <Text numberOfLines={1} className="text-2xl font-extrabold tracking-tight text-foreground">
          {tr.home.title}
        </Text>
      </View>
      <StreakPill streak={streak} />
    </View>
  );
}

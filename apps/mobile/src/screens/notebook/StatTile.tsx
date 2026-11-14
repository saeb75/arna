import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { CountUp } from "../../components/ui/CountUp";

/** İlerlemenin tek rakamı: tonlu ikon karosu, sayarak yükselen sayı, ne saydığı. */
export function StatTile({ icon: Icon, color, tint, value, label, delay = 0 }: { icon: LucideIcon; color: string; tint: string; value: number; label: string; delay?: number }) {
  return (
    <View accessible accessibilityLabel={`${value} ${label}`} className="flex-1 gap-3 rounded-2xl border border-border bg-card p-3.5">
      <View className={`size-8 items-center justify-center rounded-xl ${tint}`}>
        <Icon color={color} size={17} strokeWidth={2.2} />
      </View>
      <View className="gap-0.5">
        <CountUp to={value} delay={delay} className="text-xl font-extrabold tracking-tight text-foreground" />
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {label}
        </Text>
      </View>
    </View>
  );
}

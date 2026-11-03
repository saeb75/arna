import type { ReactNode } from "react";
import { Text, View } from "react-native";

const TONE = {
  muted: { box: "bg-muted", text: "text-muted-foreground" },
  brand: { box: "bg-brand/15", text: "text-brand" },
  positive: { box: "bg-positive/15", text: "text-positive" },
  onImage: { box: "bg-scrim/30", text: "text-on-image" },
} as const;

/** Küçük hap — durum ya da kısa bilgi. */
export function Badge({ label, tone = "muted", icon, className = "" }: { label: string; tone?: keyof typeof TONE; icon?: ReactNode; className?: string }) {
  return (
    <View className={`h-6 flex-row items-center gap-1 self-start rounded-full px-2.5 ${TONE[tone].box} ${className}`}>
      {icon}
      <Text className={`text-xs font-bold ${TONE[tone].text}`}>{label}</Text>
    </View>
  );
}

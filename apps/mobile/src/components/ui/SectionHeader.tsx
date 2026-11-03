import { Text, View } from "react-native";

/** Bölüm başlığı (+ isteğe bağlı alt satır). */
export function SectionHeader({ title, subtitle, className = "" }: { title: string; subtitle?: string; className?: string }) {
  return (
    <View className={`gap-0.5 ${className}`}>
      <Text accessibilityRole="header" className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </Text>
      {subtitle ? <Text className="text-sm text-muted-foreground">{subtitle}</Text> : null}
    </View>
  );
}

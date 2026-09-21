import { Text, View } from "react-native";
import type { RichText } from "@glotmate/contracts";

/** İpucu kartı — uyarı tonlu, RichText parçalı (web'deki hintShown karşılığı). */
export function HintCard({ hint, label }: { hint: RichText; label: string }) {
  return (
    <View className="mx-4 mb-2 self-end rounded-2xl border border-warning/40 bg-warning/10 px-4 py-2.5">
      <Text className="mb-0.5 text-xs font-semibold text-warning">{label}</Text>
      <Text className="text-sm text-foreground">
        {hint.map((r, i) => (
          <Text key={i} className={r.lang === "en" ? "font-semibold text-accent" : ""}>
            {r.text}
          </Text>
        ))}
      </Text>
    </View>
  );
}

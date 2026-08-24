import { Text, View } from "react-native";
import type { RichText } from "@arna/contracts";

/** İpucu kartı — amber tonlu, RichText parçalı (web'deki hintShown karşılığı). */
export function HintCard({ hint, label }: { hint: RichText; label: string }) {
  return (
    <View className="mx-4 mb-2 self-end rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5">
      <Text className="mb-0.5 text-xs font-semibold text-amber-400">{label}</Text>
      <Text className="text-sm text-white">
        {hint.map((r, i) => (
          <Text key={i} className={r.lang === "en" ? "font-semibold text-indigo-200" : ""}>
            {r.text}
          </Text>
        ))}
      </Text>
    </View>
  );
}

import { Text, View } from "react-native";
import { CircleCheck } from "lucide-react-native";
import type { CefrLevel } from "@glotmate/contracts";
import { tr } from "../../i18n/tr";
import { LEVEL_ROW_H, type LevelState } from "../../lib/lessonPath";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Yolu seviyelere bölen başlık (A1 · Beginner …). Üç hâl: profilin altı
 * "Tamamlandı", profilin kendisi vurgulu, üstü sönük. Yükseklik LEVEL_ROW_H ile
 * bit-uyumlu olmak ZORUNDA (getItemLayout ölçmeden buna güveniyor).
 */
export function LevelBanner({ level, label, state }: { level: CefrLevel; label: string; state: LevelState }) {
  const colors = useThemeColors();
  const active = state === "active";
  const dim = state === "upcoming";
  return (
    <View className="items-center justify-center gap-1.5" style={{ height: LEVEL_ROW_H }}>
      <View className="flex-row items-center gap-2.5">
        <View className={`h-8 min-w-11 items-center justify-center rounded-lg px-2 ${active ? "bg-brand" : "bg-muted"}`}>
          <Text className={`text-base font-extrabold ${active ? "text-on-brand" : dim ? "text-muted-foreground" : "text-foreground"}`}>{level}</Text>
        </View>
        <Text className={`text-xl font-extrabold tracking-tight ${dim ? "text-muted-foreground" : "text-foreground"}`}>{label}</Text>
      </View>
      {state === "completed" ? (
        <View className="flex-row items-center gap-1">
          <CircleCheck color={colors.positive} size={14} strokeWidth={2.4} />
          <Text className="text-xs font-semibold text-positive">{tr.home.completedLevel}</Text>
        </View>
      ) : null}
    </View>
  );
}

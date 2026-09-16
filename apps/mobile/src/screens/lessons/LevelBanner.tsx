import { Text, View } from "react-native";
import type { CefrLevel } from "@arna/contracts";
import { LEVEL_ROW_H, type LevelState } from "../../lib/lessonPath";

/**
 * Yolu seviyelere bölen büyük başlık (A1 · Beginner …).
 * Üç hâl: profilin altı ✓ "Tamamlandı" (geçilmiş müfredat), profilin kendisi
 * vurgulu, üstü sönük. Yükseklik lib'deki LEVEL_ROW_H ile bit-uyumlu olmak
 * ZORUNDA — getItemLayout ölçüm yapmadan bu değere güveniyor (bkz. PathNode).
 */
export function LevelBanner({
  level,
  label,
  state,
}: {
  level: CefrLevel;
  label: string;
  state: LevelState;
}) {
  const dim = state === "upcoming";
  return (
    <View className="items-center justify-center gap-1" style={{ height: LEVEL_ROW_H }}>
      <View className="flex-row items-center gap-2">
        <View className={`rounded-lg px-2.5 py-1 ${state === "active" ? "bg-primary" : "bg-surface"}`}>
          <Text className={`text-base font-bold ${dim ? "text-muted" : "text-white"}`}>{level}</Text>
        </View>
        <Text className={`text-lg font-bold ${dim ? "text-muted" : "text-white"}`}>{label}</Text>
        {state === "completed" && <Text className="text-base text-green-400">✓</Text>}
      </View>
      {state === "completed" && <Text className="text-xs text-muted">Tamamlandı</Text>}
    </View>
  );
}

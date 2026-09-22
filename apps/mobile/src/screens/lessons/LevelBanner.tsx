import { Text, View } from "react-native";
import type { CefrLevel } from "@glotmate/contracts";
import { LEVEL_ROW_H, type LevelState, type RowTotals } from "../../lib/lessonPath";

const SUBTITLE: Record<LevelState, string> = {
  completed: "Tamamlandı",
  active: "Şu anki seviyen",
  upcoming: "Sırada",
};

interface LevelBannerProps {
  level: CefrLevel;
  label: string;
  state: LevelState;
  totals: RowTotals;
}

/**
 * Yolu seviyelere bölen kart (A1 · Beginner …) — omurgayı kesen TEK satır.
 * Üç hâl: profilin altı "Tamamlandı" (geçilmiş müfredat, çubuk dolu), profilin
 * kendisi mor kutu, üstü sönük. Yükseklik lib'deki LEVEL_ROW_H ile bit-uyumlu
 * olmak ZORUNDA — getItemLayout ölçüm yapmadan bu değere güveniyor.
 */
export function LevelBanner({ level, label, state, totals }: LevelBannerProps) {
  const pct = totals.lessons ? Math.round((totals.completed / totals.lessons) * 100) : 0;
  const active = state === "active";
  return (
    <View className="justify-center px-4" style={{ height: LEVEL_ROW_H }}>
      <View className="rounded-2xl border border-border bg-surface p-4">
        <View className="flex-row items-center gap-3">
          <View
            className={`size-11 items-center justify-center rounded-xl ${active ? "bg-primary" : "bg-nodeIdle"}`}
          >
            <Text className={`text-base font-bold ${active ? "text-onPrimary" : "text-foreground"}`}>{level}</Text>
          </View>
          <View className="flex-1">
            <Text numberOfLines={1} className="text-lg font-bold text-foreground">
              {label}
            </Text>
            <Text className={`text-xs ${state === "completed" ? "text-success" : "text-muted"}`}>
              {SUBTITLE[state]}
              {state === "completed" ? " ✓" : ""}
            </Text>
          </View>
          <Text className="text-sm font-semibold text-muted">
            {totals.completed}/{totals.lessons}
          </Text>
        </View>

        <View className="mt-3 h-2 overflow-hidden rounded-full bg-nodeIdle">
          {/* Genişlik yüzdesi ÇALIŞMA ZAMANI değeri — NativeWind sınıfıyla ifade edilemez */}
          <View className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </View>
      </View>
    </View>
  );
}

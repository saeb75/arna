import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { HapticsService } from "../../services/HapticsService";

interface TileBuilderProps {
  /** Havuzdaki kartlar — sıra çağıranındır (karıştırılmış gelir) */
  tiles: string[];
  /** Kurulan cümle — `tiles` içindeki indeksler, dizilme sırasıyla */
  built: number[];
  checked: boolean;
  onChange: (built: number[]) => void;
  /** Kontrolden sonra kurulan satırın tonu */
  tone?: "positive" | "negative";
}

/**
 * Kartlarla cümle kurma — ünite testi (sıralama) ve oyun bloğu (kelimeleri sırala,
 * duyduğuna dokun) ortak dili. Havuzdan kart alınır, kurulan cümleden dokunarak
 * geri konur. Sürükleme yok: dokunma tek ve öngörülebilir hareket.
 */
export function TileBuilder({ tiles, built, checked, onChange, tone }: TileBuilderProps) {
  const frame =
    tone === "positive" ? "border-positive bg-positive/10" : tone === "negative" ? "border-negative bg-negative/10" : "border-border bg-card";
  return (
    <View className="gap-6">
      <View className={`min-h-24 flex-row flex-wrap content-start gap-2 rounded-3xl border-2 border-dashed p-3 ${frame}`}>
        {built.map((tileIdx, pos) => (
          <Animated.View key={`${tileIdx}-${pos}`} entering={FadeIn.duration(180)} layout={LinearTransition.duration(220)}>
            <Pressable
              disabled={checked}
              onPress={() => {
                HapticsService.selection();
                onChange(built.filter((_, i) => i !== pos));
              }}
              className="rounded-xl border-2 border-brand bg-brand/10 px-3.5 py-2 active:opacity-80"
            >
              <Text className="text-base font-semibold text-foreground">{tiles[tileIdx]}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      <View className="flex-row flex-wrap justify-center gap-2">
        {tiles.map((tile, i) => {
          const used = built.includes(i);
          return (
            <Pressable
              key={i}
              disabled={checked || used}
              onPress={() => {
                HapticsService.selection();
                onChange([...built, i]);
              }}
              className={`rounded-xl border-2 border-border bg-card px-3.5 py-2 active:opacity-80 ${used ? "opacity-25" : ""}`}
            >
              <Text className="text-base font-semibold text-foreground">{tile}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

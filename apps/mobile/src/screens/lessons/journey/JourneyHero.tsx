import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { MapPin } from "lucide-react-native";
import { StreakPill } from "../../../components/shared/StreakPill";
import { tr } from "../../../i18n/tr";
import { JOURNEY_HERO_H } from "../../../lib/journeyPath";
import { useThemeColors } from "../../../theme/useThemeColors";
import { JourneyPortrait } from "./JourneyPortrait";
import { JourneyTodayCard } from "./JourneyTodayCard";

/**
 * Kaldığın ünitenin büyük başlığı (referans görseldeki üst bölüm): selam + seri,
 * "Öğrenme yolun" çipi, ünite adı (kanonik İngilizce), `goal` cümlesi, sağ üstte
 * öğretmenin portresi, altta bugünkü ders kartı. Yükseklik SABİT (getItemLayout).
 */
export function JourneyHero({
  name,
  streak,
  title,
  goal,
  portrait,
  hero,
  today,
}: {
  name: string;
  streak: number;
  title: string;
  goal: string;
  portrait: number | null;
  /** Şeffaf zeminli süzülen figür — yoksa portre */
  hero: number | null;
  today: ComponentProps<typeof JourneyTodayCard>;
}) {
  const colors = useThemeColors();
  return (
    // Sabit yükseklik lib'den — gerekçeli inline stil
    <View className="px-4" style={{ height: JOURNEY_HERO_H }}>
      <View className="h-10 flex-row items-center justify-between">
        <Text numberOfLines={1} className="flex-1 text-[14px] font-semibold text-muted-foreground">
          {tr.home.greeting(name)}
        </Text>
        <StreakPill streak={streak} />
      </View>

      <View className="absolute right-1 top-10">
        <JourneyPortrait hero={hero} portrait={portrait} />
      </View>

      <View className="mt-3 w-[60%] gap-2">
        <View className="flex-row items-center gap-1 self-start rounded-full bg-brand/10 px-2.5 py-1">
          <MapPin color={colors.brand} size={12} strokeWidth={2.4} />
          <Text className="text-[11px] font-bold text-brand">{tr.journey.chip}</Text>
        </View>
        <Text numberOfLines={2} className="text-[26px] font-extrabold leading-[30px] tracking-tight text-foreground">
          {title}
        </Text>
        <Text numberOfLines={2} className="text-[13px] leading-[18px] text-muted-foreground">
          {goal}
        </Text>
      </View>

      <View className="absolute inset-x-4 bottom-6">
        <JourneyTodayCard {...today} />
      </View>
    </View>
  );
}

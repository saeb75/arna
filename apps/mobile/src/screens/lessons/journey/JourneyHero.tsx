import { Text, View } from "react-native";
import { MapPin } from "lucide-react-native";
import { HeroCard } from "../../../components/shared/HeroCard";
import { StreakPill } from "../../../components/shared/StreakPill";
import { tr } from "../../../i18n/tr";
import { JOURNEY_HERO_H } from "../../../lib/journeyPath";

/**
 * Yolculuğun sabit başlığı: selam + seri, altında TEK cam kart (`HeroCard` — 14 Kas 2026,
 * kullanıcı: "header bir kart gibi olsun"): solda kaldığın ders — "Bugünkü ders" çipi, ders
 * adı (kanonik İngilizce), seviye · ünite, "Başla/Devam" hapı; sağda öğretmenin figürü.
 * Ayrı "bugünkü ders" kartı YOK (kart figürün soluna alındı). Ders yoksa (seviye bitti)
 * hap görünmez. Yükseklik SABİT (lib: selam satırı + kart + boşluklar).
 */
export function JourneyHero({
  name,
  streak,
  title,
  subtitle,
  action,
  onPress,
  portrait,
  hero,
}: {
  name: string;
  streak: number;
  /** Kaldığın dersin adı (yoksa "seviyeyi bitirdin") */
  title: string;
  subtitle: string;
  /** null → eylem yok */
  action: string | null;
  onPress: () => void;
  portrait: number | null;
  /** Şeffaf zeminli süzülen figür — yoksa portre */
  hero: number | null;
}) {
  return (
    // Sabit yükseklik lib'den — gerekçeli inline stil
    <View className="px-4" style={{ height: JOURNEY_HERO_H }}>
      <View className="h-10 flex-row items-center justify-between">
        <Text numberOfLines={1} className="flex-1 text-[14px] font-semibold text-muted-foreground">
          {tr.home.greeting(name)}
        </Text>
        <StreakPill streak={streak} />
      </View>
      <View className="mt-3">
        <HeroCard
          chipIcon={MapPin}
          chip={tr.journey.todayLesson}
          title={title}
          subtitle={subtitle}
          action={action}
          onPress={onPress}
          portrait={portrait}
          hero={hero}
        />
      </View>
    </View>
  );
}

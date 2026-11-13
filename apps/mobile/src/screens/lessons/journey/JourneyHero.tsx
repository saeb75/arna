import { Pressable, Text, View } from "react-native";
import { ArrowRight, MapPin } from "lucide-react-native";
import { StreakPill } from "../../../components/shared/StreakPill";
import { GradientFill } from "../../../components/ui/GradientFill";
import { tr } from "../../../i18n/tr";
import { JOURNEY_HERO_H } from "../../../lib/journeyPath";
import { HapticsService } from "../../../services/HapticsService";
import { useThemeColors } from "../../../theme/useThemeColors";
import { withAlpha } from "../../../../colors";
import { GLASS, GlassFill } from "./JourneyGlass";
import { JourneyPortrait } from "./JourneyPortrait";

/** Başlık kartının yüksekliği (hero = selam satırı + kart + alt boşluk) */
const CARD_H = 184;

/**
 * Yolculuğun sabit başlığı: selam + seri, altında TEK KART (iOS 26'da Liquid Glass —
 * 14 Kas 2026, kullanıcı: "header bir kart gibi olsun"): sağda öğretmenin figürü, SOLUNDA kaldığın
 * ders — "Bugünkü ders" çipi, ders adı (kanonik İngilizce), seviye · ünite ve gradyan
 * "Başla/Devam" hapı (tek dokunuşla derse girer). Ayrı "bugünkü ders" kartı YOK
 * (14 Kas 2026, kullanıcı: figürün solundaki ünite adı/hedefi işe yaramıyordu, kart
 * oraya alındı). Ders yoksa (seviye bitti) hap görünmez. Yükseklik SABİT (lib).
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

      {/* Kart: kaldığın ders solda, öğretmen sağda — cam (iOS 26) ya da dolu kart */}
      <View
        className={`mt-3 flex-row items-center overflow-hidden rounded-[28px] pl-5 pr-2 ${
          GLASS ? "" : "border border-border bg-card shadow-md shadow-scrim/10"
        }`}
        // Sabit tasarım ölçüsü — gerekçeli inline stil
        style={{ height: CARD_H }}
      >
        <GlassFill radius={28} tint={withAlpha(colors.brand, 0.08)} />
        <View className="flex-1 gap-1.5 py-3.5">
          <View className="flex-row items-center gap-1 self-start rounded-full bg-brand/10 px-2.5 py-1">
            <MapPin color={colors.brand} size={12} strokeWidth={2.4} />
            <Text className="text-[11px] font-bold text-brand">{tr.journey.todayLesson}</Text>
          </View>
          <Text numberOfLines={2} className="text-[24px] font-extrabold leading-[28px] tracking-tight text-foreground">
            {title}
          </Text>
          <Text numberOfLines={1} className="text-[12.5px] text-muted-foreground">
            {subtitle}
          </Text>
          {action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${action}: ${title}`}
              onPress={() => {
                HapticsService.tap();
                onPress();
              }}
              className="mt-1 h-10 flex-row items-center gap-1.5 self-start overflow-hidden rounded-full px-5 shadow-md shadow-brand/30 active:opacity-90"
            >
              <GradientFill />
              <Text className="text-[15px] font-extrabold text-on-brand">{action}</Text>
              <ArrowRight color={colors["on-brand"]} size={16} strokeWidth={2.6} />
            </Pressable>
          ) : null}
        </View>
        <View>
          <JourneyPortrait hero={hero} portrait={portrait} />
        </View>
      </View>
    </View>
  );
}

import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Brain, Crown, Drama, GraduationCap } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { HeroCard } from "./HeroCard";

/**
 * Paywall'ın kahramanı: Ders · Rol yap · Hafıza kart yelpazesi ve altında PRO
 * hapı. Alan darsa (küçük telefon, uzun plan listesi) yelpaze küçülür, sığmazsa
 * hiç çizilmez — sayfa yine tek ekranda okunur.
 */
export function PaywallHero({ width, height }: { width: number; height: number }) {
  const colors = useThemeColors();
  const size = Math.min(width * 0.34, 140, (height - 40) / 1.35);
  if (size < 70) return null;
  return (
    <View className="items-center justify-center" style={{ height }}>
      <View className="items-center justify-center" style={{ width: size * 2.6, height: size * 1.35 }}>
        <HeroCard slot={-1} size={size} from={colors["cat-work"]} to={colors["cat-work-deep"]} icon={GraduationCap} label={tr.paywall.heroCards.lesson} />
        <HeroCard slot={1} size={size} from={colors["cat-health"]} to={colors["cat-health-deep"]} icon={Brain} label={tr.paywall.heroCards.memory} />
        <HeroCard slot={0} size={size} from={colors["brand-from"]} to={colors["brand-to"]} icon={Drama} label={tr.paywall.heroCards.roleplay} />
      </View>
      <Animated.View entering={FadeIn.delay(700).duration(400)} className="mt-3 flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-1.5">
        <Crown color={colors["primary-foreground"]} size={16} strokeWidth={2.4} />
        <Text className="text-sm font-extrabold tracking-widest text-primary-foreground">{tr.paywall.pro}</Text>
      </Animated.View>
    </View>
  );
}

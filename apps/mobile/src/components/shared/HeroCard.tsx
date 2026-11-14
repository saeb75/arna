import { Pressable, Text, View } from "react-native";
import { ArrowRight, type LucideIcon } from "lucide-react-native";
import { withAlpha } from "../../../colors";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";
import { GLASS, GlassFill } from "../ui/GlassFill";
import { GradientFill } from "../ui/GradientFill";
import { TutorFigure } from "./TutorFigure";

/** Kartın yüksekliği — sabit (yolculuk başlığı yüksekliğini buna göre hesaplar) */
export const HERO_CARD_H = 184;

/**
 * SEKMELERİN BAŞLIK KARTI (14 Kas 2026; yolculuk + rol yap aynı dili konuşsun): iOS 26'da
 * Liquid Glass, solda çip + büyük başlık + tek satır alt bilgi + gradyan eylem hapı, sağda
 * öğrencinin öğretmen figürü (ortalanmış). Eylem yoksa hap görünmez. Cam yoksa dolu kart.
 */
export function HeroCard({
  chipIcon: ChipIcon,
  chip,
  title,
  subtitle,
  action,
  onPress,
  portrait,
  hero,
}: {
  chipIcon: LucideIcon;
  chip: string;
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
    <View
      className={`flex-row items-center overflow-hidden rounded-[28px] pl-5 pr-2 ${
        GLASS ? "" : "border border-border bg-card shadow-md shadow-scrim/10"
      }`}
      // Sabit tasarım ölçüsü — gerekçeli inline stil
      style={{ height: HERO_CARD_H }}
    >
      <GlassFill radius={28} tint={withAlpha(colors.brand, 0.08)} />
      <View className="flex-1 gap-1.5 py-3.5">
        <View className="flex-row items-center gap-1 self-start rounded-full bg-brand/10 px-2.5 py-1">
          <ChipIcon color={colors.brand} size={12} strokeWidth={2.4} />
          <Text className="text-[11px] font-bold text-brand">{chip}</Text>
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
      <TutorFigure hero={hero} portrait={portrait} />
    </View>
  );
}

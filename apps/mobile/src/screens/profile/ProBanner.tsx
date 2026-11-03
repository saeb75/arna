import { useId } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import { ChevronRight, Crown, Drama, GraduationCap } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

const RADIUS = 24;
/** Kutunun etrafındaki gradyan kenar */
const EDGE = 1.5;

/** Pro çağrısı: ince gradyan kenarlı kart, sıcak ışık, iki minik kart, "Pro'yu gör" hapı. */
export function ProBanner({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tr.pro.bannerTitle}. ${tr.pro.bannerBody}`}
      onPress={onPress}
      className="overflow-hidden active:opacity-90"
      // Gradyan kenar = dolgu kadar boşluk; ölçü sabitleri tek yerde
      style={{ borderRadius: RADIUS, padding: EDGE }}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`e${uid}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors["brand-from"]} />
            <Stop offset="1" stopColor={colors["brand-to"]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#e${uid})`} />
      </Svg>
      <View className="flex-row items-center gap-4 overflow-hidden bg-card p-4" style={{ borderRadius: RADIUS - EDGE }}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id={`g${uid}`} cx="16%" cy="50%" rx="40%" ry="80%">
              <Stop offset="0" stopColor={colors.brand} stopOpacity={0.22} />
              <Stop offset="1" stopColor={colors.brand} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#g${uid})`} />
        </Svg>
        <View className="h-16 w-20 items-center justify-center">
          <View className="absolute left-1 size-12 -rotate-12 items-center justify-center overflow-hidden rounded-xl">
            <GradientFill from={colors["cat-work"]} to={colors["cat-work-deep"]} />
            <GraduationCap color={colors["on-image"]} size={20} />
          </View>
          <View className="absolute right-1 size-12 rotate-12 items-center justify-center overflow-hidden rounded-xl">
            <GradientFill />
            <Drama color={colors["on-image"]} size={20} />
          </View>
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-1.5">
            <Crown color={colors.brand} size={16} strokeWidth={2.4} />
            <Text className="shrink text-lg font-bold tracking-tight text-foreground">{tr.pro.bannerTitle}</Text>
          </View>
          <Text className="text-sm leading-snug text-muted-foreground">{tr.pro.bannerBody}</Text>
          <View className="mt-2 flex-row items-center gap-0.5 self-start overflow-hidden rounded-full py-1.5 pl-3.5 pr-2.5">
            <GradientFill />
            <Text className="text-sm font-bold text-on-brand">{tr.pro.bannerCta}</Text>
            <ChevronRight color={colors["on-brand"]} size={16} strokeWidth={2.6} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

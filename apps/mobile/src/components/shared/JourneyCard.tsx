import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text, View } from "react-native";
import { Check, ChevronRight, type LucideIcon } from "lucide-react-native";
import { withAlpha } from "../../../colors";
import { GLASS, GlassFill } from "../ui/GlassFill";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

/** Hap kartın yüksekliği */
export const JOURNEY_CARD_H = 50;

export type JourneyCardState = "completed" | "current" | "ready" | "upcoming";

/**
 * Yolculuğun HAP KARTI — yalnız görünüm (`JourneyStop`'tan ayrıldı, 15 Kas 2026: onboarding'in
 * mini yolu ana sayfayla BİREBİR aynı görünsün). Solda konu ikonu, ad + alt bilgi, sağda ok ya
 * da bitmişse yeşil onay; kaldığın ders marka çerçeve + üstte rozet, ünite testi altın tonlu.
 * iOS 26'da native Liquid Glass, yoksa dolu kart. Konumu çağıran `style` ile verir
 * (mutlak konum + genişlik); yükseklik sabittir. `onPress` yoksa dokunulmaz (süs).
 */
export function JourneyCard({
  title,
  meta,
  icon: Icon,
  state,
  isTest = false,
  badge = null,
  metaHighlight = false,
  onPress,
  style,
}: {
  title: string;
  meta: string;
  icon: LucideIcon;
  state: JourneyCardState;
  isTest?: boolean;
  badge?: string | null;
  /** Alt bilgi altın mürekkeple (hazır ünite testi) */
  metaHighlight?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors();
  const current = state === "current";
  const dim = state === "upcoming";
  const done = state === "completed";

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${title}. ${meta}`}
      disabled={!onPress}
      onPress={() => {
        HapticsService.tap();
        onPress?.();
      }}
      className={`flex-row items-center gap-2 rounded-full pl-2.5 pr-2.5 ${
        GLASS
          ? current
            ? "border border-brand/50"
            : ""
          : `border bg-card shadow-sm shadow-scrim/5 active:opacity-80 ${
              current ? "border-brand/60" : isTest ? "border-test-face/70" : "border-border"
            } ${dim && !current ? "opacity-90" : ""}`
      }`}
      // Konum çağırandan, yükseklik sabit — gerekçeli inline stil
      style={[{ height: JOURNEY_CARD_H }, style]}
    >
      <GlassFill
        radius={JOURNEY_CARD_H / 2}
        interactive={!!onPress}
        tint={current ? withAlpha(colors.brand, 0.18) : isTest ? withAlpha(colors["test-face"], 0.22) : undefined}
      />
      {/* Konu ikonu kutucuğu (ders başına elle seçilmiş — domain/lessonIcon); test kupa */}
      <View
        className={`size-8 items-center justify-center rounded-[10px] border ${
          current ? "border-brand/30 bg-brand/15" : isTest ? "border-test-face/40 bg-test-face/15" : "border-border bg-muted/60"
        }`}
      >
        <Icon color={current ? colors.brand : isTest ? colors["test-ink"] : colors["muted-foreground"]} size={15} strokeWidth={2.2} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={2}
          className={`text-[13px] leading-4 ${current || isTest ? "font-bold" : "font-semibold"} ${
            current ? "text-brand" : dim ? "text-foreground/70" : "text-foreground"
          }`}
        >
          {title}
        </Text>
        <Text numberOfLines={1} className={`text-[10.5px] ${metaHighlight ? "text-test-ink" : "text-muted-foreground"}`}>
          {meta}
        </Text>
      </View>
      {done ? (
        <View className="size-6 items-center justify-center rounded-full bg-positive">
          <Check color={colors["on-brand"]} size={13} strokeWidth={3.2} />
        </View>
      ) : (
        <View className={`size-6 items-center justify-center rounded-full ${current ? "bg-brand" : "bg-muted"}`}>
          <ChevronRight color={current ? colors["on-brand"] : colors["muted-foreground"]} size={13} strokeWidth={2.4} />
        </View>
      )}

      {badge ? (
        <View className="absolute left-4 rounded-full bg-brand/15 px-2 py-0.5" style={{ top: -18 }}>
          <Text className="text-[10px] font-bold text-brand">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

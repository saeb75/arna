import { useCallback, useMemo, useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CtaButton } from "../../components/ui/CtaButton";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { tr } from "../../i18n/tr";
import { useScheme } from "../../theme/useScheme";
import { useThemeColors } from "../../theme/useThemeColors";
import { PathScene } from "./PathScene";
import { ProgressSegments } from "./ProgressSegments";
import { RoleplayScene } from "./RoleplayScene";
import { SlideText } from "./SlideText";
import { TalkScene } from "./TalkScene";

const PAGES = ["talk", "roleplay", "path"] as const;
const COUNT = PAGES.length;

/**
 * İlk sayfalar: GlotMate'in üç vaadi, her biri UYGULAMANIN KENDİ parçalarıyla canlı bir sahne
 * (15 Kas 2026 yeniden tasarımı, kullanıcı: "eski tasarıma göre, ana sayfa değişti"):
 * öğretmen figürü + sohbet, Rol Yap kartları karuseli, yolculuğun cam hap kartları. Zemin ana
 * sayfanınki (canvas + marka ışığı). İlerleme her sayfada altta "Devam" butonuyla (eski etiketsiz
 * dönen nokta emekli — soru sayfalarıyla aynı eylem); sola kaydırmak ileri, sağa geri götürür.
 */
export function IntroPager({ onDone, onHaveAccount }: { onDone: () => void; onHaveAccount: () => void }) {
  const colors = useThemeColors();
  const scheme = useScheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [backwards, setBackwards] = useState(false);

  const go = useCallback(
    (to: number) => {
      if (to < 0) return;
      if (to >= COUNT) {
        onDone();
        return;
      }
      setBackwards(to < index);
      setIndex(to);
    },
    [index, onDone],
  );

  // Sayfa değişince yeniden kurulur (güncel sayfayı kapanıştan okur)
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -50 || g.vx < -0.4) go(index + 1);
          else if (g.dx > 50 || g.vx > 0.4) go(index - 1);
        },
      }),
    [go, index],
  );

  const page = PAGES[index]!;
  const copy = tr.onboarding.intro[page];
  const ease = Easing.out(Easing.cubic);
  const entering = reduceMotion
    ? FadeIn.duration(260)
    : (backwards ? SlideInLeft : SlideInRight).duration(400).easing(ease);
  const exiting = reduceMotion
    ? FadeOut.duration(180)
    : (backwards ? SlideOutRight : SlideOutLeft).duration(340).easing(Easing.in(Easing.cubic));

  return (
    <View className="flex-1 bg-canvas" {...swipe.panHandlers}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} animated />
      <ScreenGlow height={520} />
      {/* Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil */}
      <View style={{ paddingTop: insets.top + 10 }}>
        <View className="h-9 flex-row items-center gap-4 px-6">
          <ProgressSegments count={COUNT} index={index} color={colors.foreground} />
          {index === 0 ? (
            <Pressable accessibilityRole="button" onPress={onHaveAccount} hitSlop={10} className="active:opacity-70">
              <Text className="text-sm font-semibold text-foreground">{tr.onboarding.haveAccount}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View className="flex-1">
        <Animated.View key={page} entering={entering} exiting={exiting} className="absolute inset-0 px-6 pt-4">
          <View className="flex-1 justify-center">
            {page === "talk" ? <TalkScene /> : page === "roleplay" ? <RoleplayScene /> : <PathScene />}
          </View>
          <View className="gap-2 pt-5">
            {page === "talk" ? <Text className="text-xs font-bold tracking-widest text-brand">{tr.onboarding.intro.eyebrow}</Text> : null}
            <SlideText
              title={copy.title}
              body={copy.body}
              color={colors.foreground}
              muted={colors["muted-foreground"]}
              delay={page === "talk" ? 200 : 300}
            />
          </View>
        </Animated.View>
      </View>
      <View className="px-6 pt-5" style={{ paddingBottom: insets.bottom + 12 }}>
        <CtaButton label={index === COUNT - 1 ? tr.onboarding.finish : tr.common.continue} onPress={() => go(index + 1)} />
      </View>
    </View>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { PanResponder, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  ReduceMotion,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { withAlpha } from "../../../colors";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useScheme } from "../../theme/useScheme";
import { useThemeColors } from "../../theme/useThemeColors";
import { DOT, InversionDot, pageColor } from "./InversionDot";
import { PathScene } from "./PathScene";
import { ProgressSegments } from "./ProgressSegments";
import { RoleplayScene } from "./RoleplayScene";
import { SlideText } from "./SlideText";
import { TalkScene } from "./TalkScene";

type Tone = "page" | "brand";
const PAGES = [
  { key: "talk", tone: "page" },
  { key: "roleplay", tone: "brand" },
  { key: "path", tone: "page" },
] as const;
const TONES: Tone[] = PAGES.map((p) => p.tone);
const COUNT = PAGES.length;
/** Sorular son sayfadan sonra, ekran renginde gelir — dikişsiz geçiş */
const AFTER: Tone = "page";
const DURATION = 1000;
/** Android düz çevirir (renkler çapraz söner): dönen nokta orada kare düşürüyordu */
const PLAIN_FLIP = Platform.OS === "android";

/**
 * İlk sayfalar: GlotMate'in üç vaadi, her biri canlı bir sahneyle. Nokta bir
 * sonraki sayfaya çevirir (nokta dönüşümü), sola kaydırmak da. Son çevirme
 * ekran rengine iner, sorular dikişsiz başlar. (Sayfa arka planı ve içerik
 * geçişi animasyonlu stil — StyleSheet istisnası.)
 */
export function IntroFlip({ onDone, onHaveAccount }: { onDone: () => void; onHaveAccount: () => void }) {
  const colors = useThemeColors();
  const scheme = useScheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const plain = reduceMotion || PLAIN_FLIP;

  const palette = useMemo(
    () => [...TONES, AFTER].map((tone) => (tone === "brand" ? colors["brand-strong"] : colors.canvas)),
    [colors],
  );
  const pageColors = useSharedValue(palette);
  const progress = useSharedValue(0);
  const step = useSharedValue(0);
  const onScreen = useSharedValue(-1);
  const busy = useSharedValue(false);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    pageColors.value = palette;
  }, [palette, pageColors]);

  const page = shown < COUNT ? PAGES[shown] : undefined;
  const tone: Tone = page?.tone ?? AFTER;
  const ink = tone === "brand" ? colors["on-brand"] : colors.foreground;
  const muted = tone === "brand" ? withAlpha(colors["on-brand"], 0.8) : colors["muted-foreground"];
  const nextTone: Tone = TONES[shown + 1] ?? AFTER;
  const dotIcon = nextTone === "brand" ? colors["on-brand"] : colors.foreground;
  const lightText = tone === "brand" || scheme === "dark";

  const flip = useCallback(() => {
    if (busy.value) return;
    busy.value = true;
    HapticsService.tap();
    progress.value = withTiming(
      1,
      { duration: plain ? 420 : DURATION, easing: Easing.inOut(Easing.cubic), reduceMotion: ReduceMotion.Never },
      (done) => {
        if (!done) return;
        step.value = step.value + 1;
        progress.value = 0;
        busy.value = false;
        scheduleOnRN(setShown, step.value);
        if (step.value >= COUNT) scheduleOnRN(onDone);
      },
    );
  }, [busy, progress, step, plain, onDone]);

  // Yarı yolda sayfa değişir (renk orada döner)
  useAnimatedReaction(
    () => progress.value >= 0.5,
    (half, was) => {
      if (half && !was) scheduleOnRN(setShown, step.value + 1);
    },
  );

  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -50 || g.vx < -0.4) flip();
        },
      }),
    [flip],
  );

  const background = useAnimatedStyle(() => {
    const p = progress.value;
    const from = pageColor(pageColors.value, step.value);
    const to = pageColor(pageColors.value, step.value + 1);
    return { backgroundColor: plain ? interpolateColor(p, [0, 1], [from, to]) : p < 0.5 ? from : to };
  });
  const content = useAnimatedStyle(() => {
    const p = progress.value;
    if (onScreen.value !== (p < 0.5 ? step.value : step.value + 1)) return { opacity: 0, transform: [{ translateX: 0 }] };
    return p < 0.5
      ? {
          opacity: interpolate(p, [0, 0.3], [1, 0], "clamp"),
          transform: [{ translateX: interpolate(p, [0, 0.4], [0, -28], "clamp") }],
        }
      : { opacity: interpolate(p, [0.5, 0.56], [0, 1], "clamp"), transform: [{ translateX: 0 }] };
  });

  const copy = page ? tr.onboarding.intro[page.key] : null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, background]} {...swipe.panHandlers}>
      <StatusBar style={lightText ? "light" : "dark"} animated />
      <Animated.View style={[styles.page, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + DOT + 44 }, content]}>
        <View className="h-9 flex-row items-center gap-4 px-6">
          <ProgressSegments count={COUNT} index={Math.min(shown, COUNT - 1)} color={ink} />
          {shown === 0 ? (
            <Pressable accessibilityRole="button" onPress={onHaveAccount} hitSlop={10} className="active:opacity-70">
              <Text className="text-sm font-semibold" style={{ color: ink }}>
                {tr.onboarding.haveAccount}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {page && copy ? (
          <View key={page.key} className="flex-1 justify-between px-6 pt-6" onLayout={() => (onScreen.value = shown)}>
            <View className="flex-1 justify-center">
              {page.key === "talk" ? <TalkScene /> : page.key === "roleplay" ? <RoleplayScene /> : <PathScene />}
            </View>
            <View className="gap-2 pt-6">
              {page.key === "talk" ? (
                <Text className="text-xs font-bold tracking-widest text-brand">{tr.onboarding.intro.eyebrow}</Text>
              ) : null}
              <SlideText title={copy.title} body={copy.body} color={ink} muted={muted} delay={page.key === "talk" ? 200 : 380} />
            </View>
          </View>
        ) : null}
      </Animated.View>
      <View collapsable={false} style={[styles.dot, { bottom: insets.bottom + 26 }]} pointerEvents="box-none">
        <InversionDot
          progress={progress}
          step={step}
          colors={pageColors}
          iconColor={dotIcon}
          reduceMotion={plain}
          label={shown >= COUNT - 1 ? tr.onboarding.finish : tr.onboarding.step(shown + 2, COUNT)}
          onPress={flip}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  dot: { position: "absolute", left: 0, right: 0, alignItems: "center" },
});

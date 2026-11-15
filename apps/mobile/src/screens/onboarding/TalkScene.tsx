import { Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOut } from "react-native-reanimated";
import { Mic } from "lucide-react-native";
import { withAlpha } from "../../../colors";
import { TutorFigure } from "../../components/shared/TutorFigure";
import { GLASS, GlassFill } from "../../components/ui/GlassFill";
import { GradientFill } from "../../components/ui/GradientFill";
import { useDraftTutorArt } from "../../hooks/useDraftTutorArt";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { useLoopStep } from "./useLoopStep";

const rise = FadeInDown.duration(380).easing(Easing.out(Easing.cubic));
/** Kısa ekranda (SE sınıfı) figür küçülür — metin ve buton sığsın */
const SHORT_SCREEN = 740;

/**
 * Tanıtım 1: ana sayfadaki süzülen öğretmen figürü + altında cam sohbet kartı — hoca sorar,
 * öğrenci cevaplar, hoca nazikçe düzeltir (doğru İngilizce cümle ayrı satırda, vurgulu —
 * ders ekranındaki gibi). Döngüde.
 */
export function TalkScene() {
  const colors = useThemeColors();
  const { height } = useWindowDimensions();
  const step = useLoopStep(4, 1300);
  const s = tr.onboarding.scenes;
  const { hero, portrait } = useDraftTutorArt();
  const name = useDraftTutorName();
  const scale = height < SHORT_SCREEN ? 0.72 : 1;
  return (
    <View className="items-center">
      {/* Figür sabit 150×150 kutu — kısa ekranda ölçekle küçülür, boşluğu negatif kenarla geri alınır */}
      <View style={{ transform: [{ scale }], marginVertical: (-150 * (1 - scale)) / 2, marginBottom: -18 * scale }}>
        <TutorFigure hero={hero} portrait={portrait} />
      </View>
      <View
        className={`w-full gap-3 overflow-hidden rounded-[28px] p-4 ${GLASS ? "" : "border border-border bg-card shadow-md shadow-scrim/10"}`}
      >
        <GlassFill radius={28} tint={withAlpha(colors.brand, 0.06)} />
        <View className="min-h-[178px] gap-2.5">
          {step >= 0 ? (
            <Animated.View entering={rise} exiting={FadeOut.duration(200)} className="gap-1 self-start">
              <Text className="ml-2 text-[11px] font-bold text-muted-foreground">{name}</Text>
              <View className="rounded-3xl rounded-tl-lg bg-muted px-4 py-2.5">
                <Text className="text-[15px] font-semibold text-brand">{s.emmaAsk}</Text>
              </View>
            </Animated.View>
          ) : null}
          {step >= 1 ? (
            <Animated.View entering={rise} exiting={FadeOut.duration(200)} className="self-end rounded-3xl rounded-br-lg bg-primary px-4 py-2.5">
              <Text className="text-[15px] font-semibold text-primary-foreground">{s.youSay}</Text>
            </Animated.View>
          ) : null}
          {step >= 2 ? (
            <Animated.View entering={rise} exiting={FadeOut.duration(200)} className="max-w-[90%] gap-1 self-start rounded-3xl rounded-bl-lg bg-muted px-4 py-2.5">
              <Text className="text-[15px] leading-snug text-foreground">{s.emmaFix}</Text>
              <Text className="text-[15px] font-bold text-brand">{s.emmaFixEn}</Text>
            </Animated.View>
          ) : null}
        </View>
        <View className="flex-row items-center justify-center gap-2.5">
          <View className="size-11 items-center justify-center overflow-hidden rounded-full shadow-md shadow-brand/30">
            <GradientFill />
            <Mic color={colors["on-brand"]} size={20} strokeWidth={2.4} />
          </View>
          <Text className="text-sm font-semibold text-muted-foreground">{s.micHint}</Text>
        </View>
      </View>
    </View>
  );
}


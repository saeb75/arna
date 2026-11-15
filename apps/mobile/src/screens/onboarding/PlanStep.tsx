import { useEffect, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarCheck, Clock, Gauge, GraduationCap, Languages, MapPin, MessageCircle, type LucideIcon } from "lucide-react-native";
import { withAlpha } from "../../../colors";
import { HeroCard } from "../../components/shared/HeroCard";
import { CountUp } from "../../components/ui/CountUp";
import { CtaButton } from "../../components/ui/CtaButton";
import { GLASS, GlassFill } from "../../components/ui/GlassFill";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { Skeleton } from "../../components/ui/Skeleton";
import { CurriculumController } from "../../controllers/CurriculumController";
import { OnboardingController } from "../../controllers/OnboardingController";
import { DEFAULT_NATIVE_LANGUAGE, languageName } from "../../domain/language";
import { useDraftTutorArt } from "../../hooks/useDraftTutorArt";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { currentPlacement } from "../../lib/lessonPath";
import { useCurriculumStore } from "../../stores/useCurriculumStore";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useTutorsStore } from "../../stores/useTutorsStore";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Kişisel plan — ANA SAYFANIN ÖNİZLEMESİ (15 Kas 2026): üstte yolculuktaki başlık kartının aynısı
 * (`HeroCard`: ilk dersin kanonik İngilizce adı + seviye · ünite, sağda seçilen öğretmenin figürü),
 * altında cam özet (seviye, öğretmen, hedef, açıklama dili, bağlam) ve bir ayın toplamı.
 * Müfredat kayıt adımında (POST /v1/onboarding) store'a yazıldı; uygulama bu adımda yeniden
 * açıldıysa yoksa çekilir, gelene kadar kart iskelet.
 */
export function PlanStep() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const o = useOnboardingStore();
  const curriculum = useCurriculumStore((s) => s.curriculum);
  const { hero, portrait } = useDraftTutorArt();
  const goal = o.dailyGoal ?? 10;
  const sessions = Math.round((goal * 30) / 7);
  // Öğretmen seçimi yapıldıysa planda da görünsün (öğretmen kaydı yoksa satır yok)
  const hasTutors = useTutorsStore((s) => (s.tutors?.length ?? 0) > 0);
  const tutorName = useDraftTutorName();

  useEffect(() => {
    if (!curriculum) void CurriculumController.getCurriculum();
  }, [curriculum]);

  const placement = curriculum ? currentPlacement(curriculum) : null;
  const level = curriculum?.level ?? o.level;

  const rows: { Icon: LucideIcon; label: string; value: ReactNode }[] = [
    {
      Icon: Gauge,
      label: tr.onboarding.plan.level,
      value: (
        <View className="rounded-full bg-brand/15 px-3 py-1">
          <Text className="text-sm font-bold text-brand">
            {o.level} · {o.level ? tr.levels[o.level].name : ""}
          </Text>
        </View>
      ),
    },
    ...(hasTutors
      ? [{ Icon: GraduationCap, label: tr.onboarding.plan.teacher, value: <Text className="text-base font-bold text-foreground">{tutorName}</Text> }]
      : []),
    { Icon: Clock, label: tr.onboarding.plan.goal, value: <Text className="text-base font-bold text-foreground">{tr.common.minutesLong(goal)}</Text> },
    {
      Icon: Languages,
      label: tr.onboarding.plan.tutor,
      value: (
        <Text className="text-base font-bold text-foreground">
          {o.tutorLanguage === "english" ? tr.tutorLanguage.english : tr.tutorLanguage.nativeShort(languageName(DEFAULT_NATIVE_LANGUAGE))}
        </Text>
      ),
    },
    {
      Icon: MessageCircle,
      label: tr.onboarding.plan.context,
      value: <Text className="text-base font-bold text-foreground">{o.track ? tr.tracks[o.track].title : ""}</Text>,
    },
  ];
  const surface = GLASS ? "" : "border border-border bg-card";

  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 12 }}>
      <ScreenGlow height={460} />
      <ScrollView contentContainerClassName="gap-5 px-4 pb-6">
        <View className="gap-2 px-2 pt-4">
          <Animated.Text entering={enter(0)} className="text-xs font-bold tracking-widest text-brand">
            {tr.onboarding.plan.eyebrow}
          </Animated.Text>
          <Animated.Text entering={enter(1)} className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            {tr.onboarding.plan.title(o.displayName.trim())}
          </Animated.Text>
          <Animated.Text entering={enter(2)} className="text-lg leading-snug text-muted-foreground">
            {tr.onboarding.plan.body}
          </Animated.Text>
        </View>

        <Animated.View entering={enter(3)}>
          {placement && level ? (
            <HeroCard
              chipIcon={MapPin}
              chip={tr.onboarding.plan.firstLesson}
              title={placement.lesson.title}
              subtitle={placement.unitTitle ? `${level} · ${placement.unitTitle}` : `${level} · ${tr.levels[level].name}`}
              action={null}
              onPress={() => {}}
              portrait={portrait}
              hero={hero}
            />
          ) : (
            <Skeleton className="h-[184px] w-full rounded-[28px]" />
          )}
        </Animated.View>

        <Animated.View entering={enter(4)} className={`overflow-hidden rounded-3xl px-4 ${surface}`}>
          <GlassFill radius={24} />
          {rows.map(({ Icon, label, value }, i) => (
            <View key={label} className={`flex-row items-center gap-3 py-3 ${i ? "border-t border-border/70" : ""}`}>
              <View className="size-9 items-center justify-center rounded-xl bg-brand/15">
                <Icon color={colors.brand} size={18} />
              </View>
              <Text className="flex-1 text-[15px] text-muted-foreground">{label}</Text>
              {value}
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={enter(5)} className={`flex-row items-center gap-4 overflow-hidden rounded-3xl p-4 ${GLASS ? "" : "bg-brand/10"}`}>
          <GlassFill radius={24} tint={withAlpha(colors.brand, 0.14)} />
          <View className="size-14 items-center justify-center rounded-2xl bg-brand">
            <CalendarCheck color={colors["on-brand"]} size={26} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-muted-foreground">{tr.onboarding.plan.projectionLead}</Text>
            <View className="flex-row flex-wrap items-baseline">
              <CountUp to={sessions} delay={900} className="text-3xl font-extrabold text-brand" />
              <Text className="ml-2 flex-1 text-[15px] leading-snug text-foreground">{tr.onboarding.plan.projection}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      <View className="px-6 pt-2" style={{ paddingBottom: insets.bottom + 12 }}>
        <CtaButton label={tr.onboarding.plan.cta} onPress={() => void OnboardingController.afterPlan()} breathe />
      </View>
    </View>
  );
}

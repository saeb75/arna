import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Info, Languages } from "lucide-react-native";
import { RoleplayArt } from "../../components/shared/RoleplayArt";
import { CtaButton } from "../../components/ui/CtaButton";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { Skeleton } from "../../components/ui/Skeleton";
import { TopBar } from "../../components/ui/TopBar";
import { RoleplayController } from "../../controllers/RoleplayController";
import { RoleplaySessionController } from "../../controllers/RoleplaySessionController";
import { categoryLook } from "../../domain/roleplayCategories";
import { tr } from "../../i18n/tr";
import { useRoleplaySessionStore } from "../../stores/useRoleplaySessionStore";
import { useRoleplayStore } from "../../stores/useRoleplayStore";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";
import { ObjectiveRow } from "./ObjectiveRow";
import { PersonaCard } from "./PersonaCard";

const HERO_H = 300;

/**
 * BRIEF — oturum AÇMADAN önizleme: sahne, karşındaki kişi, hedefler, oynanacak
 * seviye. "Başla" oturumu açar (402 → paywall) ve oyun ekranına geçer.
 */
export function RoleplayBriefScreen({ slug }: { slug: string }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const brief = useRoleplayStore((s) => s.briefs[slug]);
  const briefError = useRoleplayStore((s) => s.briefError);
  const opening = useRoleplaySessionStore((s) => s.phase === "opening");
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  useEffect(() => {
    void RoleplayController.loadBrief(slug);
  }, [slug]);

  if (!brief) {
    return (
      <View className="flex-1 bg-canvas">
        <TopBar />
        {briefError ? (
          <View className="flex-1 justify-center px-6">
            <LoadFailed onRetry={() => void RoleplayController.loadBrief(slug)} />
          </View>
        ) : (
          <View className="gap-4">
            <Skeleton className="h-[300px] rounded-none" />
            <View className="gap-3 px-5">
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-20 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </View>
          </View>
        )}
      </View>
    );
  }

  const look = categoryLook(brief.category);
  return (
    <View className="flex-1 bg-canvas">
      {/* Reanimated kaydırıcısında içerik sınıfı garantili değil — gerekçeli inline stil */}
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Kahraman: kategori gradyanı, üstüne başlık (yükseklik güvenli alana göre) */}
        <View className="justify-end overflow-hidden rounded-b-[32px] px-5 pb-6" style={{ height: HERO_H + insets.top }}>
          <RoleplayArt category={brief.category} iconSize={220} />
          <Animated.View entering={enter(0)} className="mb-2 self-start rounded-full bg-scrim/25 px-3 py-1">
            <Text className="text-xs font-bold text-on-image">{look.label}</Text>
          </Animated.View>
          <Animated.Text entering={enter(1)} accessibilityRole="header" className="text-4xl font-extrabold leading-tight tracking-tight text-on-image">
            {brief.title}
          </Animated.Text>
        </View>

        <View className="gap-6 px-5 pt-6">
          <Animated.View entering={enter(2)}>
            <PersonaCard persona={brief.persona} label={tr.roleplay.brief.persona} />
          </Animated.View>

          <Animated.View entering={enter(3)} className="gap-2">
            <Text className="text-sm font-semibold text-muted-foreground">{tr.roleplay.brief.scene}</Text>
            <Text className="text-[17px] leading-relaxed text-foreground">{brief.scene}</Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Languages color={colors["muted-foreground"]} size={14} />
              <Text className="text-xs font-medium text-muted-foreground">{tr.roleplay.brief.english}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={enter(4)} className="gap-3">
            <View className="gap-0.5">
              <Text className="text-xl font-bold tracking-tight text-foreground">{tr.roleplay.brief.goals}</Text>
              <Text className="text-sm text-muted-foreground">{tr.roleplay.brief.goalsBody}</Text>
            </View>
            <View className="gap-1 rounded-3xl border border-border bg-card p-2">
              {brief.objectives.map((o, i) => (
                <ObjectiveRow key={o.id} index={i + 1} label={o.label} />
              ))}
            </View>
          </Animated.View>

          {brief.raised ? (
            <Animated.View entering={enter(5)} className="flex-row items-center gap-2.5 rounded-2xl bg-info/10 px-4 py-3">
              <Info color={colors.info} size={18} />
              <Text className="flex-1 text-sm font-medium text-foreground">{tr.roleplay.brief.raised(brief.playedLevel)}</Text>
            </Animated.View>
          ) : null}
        </View>
      </Animated.ScrollView>

      <View className="border-t border-border bg-background px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <CtaButton label={tr.roleplay.brief.start} busy={opening} onPress={() => void RoleplaySessionController.start(slug)} breathe />
      </View>
      <TopBar title={brief.title} scrollY={scrollY} titleAfter={HERO_H - 60} />
    </View>
  );
}


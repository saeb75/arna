import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEFAULT_AVATAR_ID } from "@glotmate/contracts";
import { FadeFill } from "../../../components/ui/FadeFill";
import { LoadFailed } from "../../../components/ui/LoadFailed";
import { ScreenGlow } from "../../../components/ui/ScreenGlow";
import { Skeleton } from "../../../components/ui/Skeleton";
import { CurriculumController } from "../../../controllers/CurriculumController";
import { MeController } from "../../../controllers/MeController";
import { tutorHero } from "../../../domain/tutorHero";
import { tutorPortrait } from "../../../domain/tutors";
import { tr } from "../../../i18n/tr";
import { buildJourneyRows, journeyHeroIndex, journeyOffsets, journeyRowHeight, type JourneyRow } from "../../../lib/journeyPath";
import { currentPlacement } from "../../../lib/lessonPath";
import { useCurriculumStore } from "../../../stores/useCurriculumStore";
import { useMeStore } from "../../../stores/useMeStore";
import { useTabBarSpace } from "../../../theme/layout";
import { useThemeColors } from "../../../theme/useThemeColors";
import { LevelBanner } from "../LevelBanner";
import { UnitHeader } from "../UnitHeader";
import { JourneyHero } from "./JourneyHero";
import { JourneyStop } from "./JourneyStop";

/**
 * ANA EKRAN — YOLCULUK görünümü (13 Kas 2026 DENEMESİ; referans görselden, GlotMate
 * renkleriyle). Kıvrımlı yol ekranı (`LessonsScreen`) dokunulmadan duruyor — geri dönüş
 * rotada tek satır (`app/(tabs)/lessons.tsx`).
 *
 * Aynı veri, aynı durumlar (`buildPathRows`); yalnız çizim farklı: A1→C2 tek liste,
 * seviye/ünite başlıkları, satır başına tek durak (düğüm + hap kart) zikzak, ünite içinde
 * S eğrili yol. Kaldığın ünitenin başlığı yerine büyük başlık bölümü (öğretmen portresi +
 * bugünkü ders) durur ve ekran ORAYA açılır; yukarı kaydırınca önceki üniteler/seviyeler.
 */
export function JourneyScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { curriculum, error } = useCurriculumStore();
  const me = useMeStore((s) => s.me);
  const stats = useMeStore((s) => s.stats);

  // ODAKLANMADA tazele: dersten dönüşte biten ders yeşile dönsün, dakika güncellensin
  useFocusEffect(
    useCallback(() => {
      void CurriculumController.getCurriculum();
      void MeController.loadStats();
      void MeController.load();
    }, []),
  );

  const rows = useMemo<JourneyRow[]>(() => (curriculum ? buildJourneyRows(curriculum) : []), [curriculum]);
  const offsets = useMemo(() => journeyOffsets(rows), [rows]);

  if (error && !curriculum) {
    return (
      <View className="flex-1 justify-center bg-canvas px-6">
        <LoadFailed onRetry={() => void CurriculumController.getCurriculum()} />
      </View>
    );
  }

  if (!curriculum) {
    return (
      // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
      <View className="flex-1 gap-3 bg-canvas px-4" style={{ paddingTop: insets.top + 8 }}>
        <Skeleton className="h-12 w-2/3 rounded-xl" />
        <Skeleton className="h-[120px] w-3/5 rounded-2xl" />
        <Skeleton className="h-[112px] rounded-[28px]" />
        <View className="gap-6 pt-8">
          <Skeleton className="h-[78px] w-4/5 self-start rounded-full" />
          <Skeleton className="h-[78px] w-4/5 self-end rounded-full" />
          <Skeleton className="h-[78px] w-4/5 self-start rounded-full" />
        </View>
      </View>
    );
  }

  const heroIndex = journeyHeroIndex(rows);
  const placement = currentPlacement(curriculum);
  const goal = me?.profile?.dailyGoalMinutes ?? 10;
  const avatarId = me?.tutor?.avatarId ?? DEFAULT_AVATAR_ID;
  const portrait = tutorPortrait(avatarId);
  const hero = tutorHero(avatarId);
  const openLesson = (id: string) => router.push(`/lesson/${id}`);

  return (
    <View className="flex-1 bg-canvas">
      <ScreenGlow height={420} />
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        showsVerticalScrollIndicator={false}
        // Güvenli alan + sekme barı ÇALIŞMA ZAMANI değerleri — gerekçeli inline stil
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: bottom }}
        getItemLayout={(_, index) => ({ length: journeyRowHeight(rows[index]!), offset: offsets[index] ?? 0, index })}
        initialScrollIndex={heroIndex}
        onScrollToIndexFailed={() => {}}
        initialNumToRender={12}
        windowSize={11}
        renderItem={({ item, index }) => {
          switch (item.kind) {
            case "level":
              return <LevelBanner level={item.level} label={item.label} state={item.state} />;
            case "unit":
              return <UnitHeader unitIndex={item.unitIndex} title={item.title} goal={item.goal} done={item.done} total={item.total} />;
            case "hero":
              return (
                <JourneyHero
                  name={me?.profile?.displayName ?? ""}
                  streak={stats?.streak ?? 0}
                  title={item.title}
                  goal={item.goal}
                  portrait={portrait}
                  hero={hero}
                  today={{
                    minutes: stats?.todayMinutes ?? 0,
                    goal,
                    title: placement?.lesson.title ?? tr.journey.levelDone,
                    subtitle: `${item.level} · ${item.levelLabel}`,
                    action: placement ? (placement.lesson.status === "in_progress" ? tr.journey.continue : tr.journey.start) : null,
                    onPress: () => placement && openLesson(placement.lesson.id),
                  }}
                />
              );
            case "stop": {
              const next = rows[index + 1];
              const { stop } = item;
              return (
                <JourneyStop
                  row={item}
                  nextHeight={next ? journeyRowHeight(next) : 0}
                  onPress={() =>
                    stop.kind === "lesson" ? openLesson(stop.lesson.id) : router.push(`/checkpoint/${stop.level}/${stop.unitIndex}`)
                  }
                />
              );
            }
          }
        }}
      />

      {/* Durum çubuğu zemini: içerik saatin altından geçerken okunur kalsın */}
      <View pointerEvents="none" className="absolute inset-x-0 top-0" style={{ height: insets.top + 18 }}>
        <View className="bg-canvas" style={{ height: insets.top }} />
        <View style={{ height: 18 }}>
          <FadeFill color={colors.canvas} from={1} to={0} />
        </View>
      </View>
    </View>
  );
}

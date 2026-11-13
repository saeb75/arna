import { useCallback, useEffect, useMemo, useRef } from "react";
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
import {
  buildJourneyRows,
  journeyContexts,
  journeyOffsets,
  journeyRowHeight,
  journeyStartIndex,
  JOURNEY_HERO_H,
  type JourneyRow,
} from "../../../lib/journeyPath";
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
 * seviye/ünite başlıkları, satır başına tek durak (düğüm + hap kart) zikzak, yılankavi yol.
 * Büyük başlık bölümü (selam + seri, ünite adı, öğretmen, bugünkü ders) ÜSTTE SABİT, yol onun
 * altından kayar (13 Kas 2026, kullanıcı). Başlık HEP kaldığın yeri gösterir — kaydırmayla
 * DEĞİŞMEZ (kullanıcı: "her scroll yaptıkça değişmesin"). Ekran kaldığın ünitenin ilk durağına açılır.
 */
export function JourneyScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { curriculum, error } = useCurriculumStore();
  const me = useMeStore((s) => s.me);
  const stats = useMeStore((s) => s.stats);

  const rows = useMemo<JourneyRow[]>(() => (curriculum ? buildJourneyRows(curriculum) : []), [curriculum]);
  const offsets = useMemo(() => journeyOffsets(rows), [rows]);
  const contexts = useMemo(() => journeyContexts(rows), [rows]);
  const startIndex = curriculum ? journeyStartIndex(rows, curriculum.level) : 0;

  /**
   * Kaldığın üniteye KONUMLAMA: `initialScrollIndex` yalnız ilk çizimde okunur. Ekran önbellekteki
   * (eski) müfredatla açılıp taze veri gelince başlık birkaç satır kayıyordu ve ekran önceki
   * seviyenin ortasında açılıyordu (canlı, 13 Kas 2026). Kullanıcı kendisi kaydırmadıkça her veri
   * değişiminde ve her odaklanmada başlığa yeniden konumlanır.
   */
  const listRef = useRef<FlatList<JourneyRow>>(null);
  const userScrolled = useRef(false);
  const startRef = useRef(startIndex);
  startRef.current = startIndex;
  const scrollToHero = useCallback(() => {
    if (userScrolled.current || !listRef.current) return;
    listRef.current.scrollToIndex({ index: startRef.current, animated: false });
  }, []);
  useEffect(() => {
    if (rows.length) requestAnimationFrame(scrollToHero);
  }, [startIndex, rows.length, scrollToHero]);

  // ODAKLANMADA tazele: dersten dönüşte biten ders yeşile dönsün, dakika güncellensin
  useFocusEffect(
    useCallback(() => {
      userScrolled.current = false;
      requestAnimationFrame(scrollToHero);
      void CurriculumController.getCurriculum();
      void MeController.loadStats();
      void MeController.load();
    }, [scrollToHero]),
  );

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
        <Skeleton className="h-[160px] w-3/5 rounded-2xl" />
        <View className="gap-6 pt-8">
          <Skeleton className="h-[78px] w-4/5 self-start rounded-full" />
          <Skeleton className="h-[78px] w-4/5 self-end rounded-full" />
          <Skeleton className="h-[78px] w-4/5 self-start rounded-full" />
        </View>
      </View>
    );
  }

  const placement = currentPlacement(curriculum);
  const avatarId = me?.tutor?.avatarId ?? DEFAULT_AVATAR_ID;
  const portrait = tutorPortrait(avatarId);
  const hero = tutorHero(avatarId);
  const openLesson = (id: string) => router.push(`/lesson/${id}`);

  // Kaldığın dersin ünitesi — sabit
  const ctx = contexts[startIndex] ?? null;
  const headerH = insets.top + JOURNEY_HERO_H;

  return (
    <View className="flex-1 bg-canvas">
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.key}
        showsVerticalScrollIndicator={false}
        // Sabit başlık + sekme barı ÇALIŞMA ZAMANI değerleri — gerekçeli inline stil
        contentContainerStyle={{ paddingTop: headerH, paddingBottom: bottom }}
        getItemLayout={(_, index) => ({ length: journeyRowHeight(rows[index]!), offset: offsets[index] ?? 0, index })}
        initialScrollIndex={startIndex}
        onScrollToIndexFailed={() => {}}
        // Kullanıcı kendisi kaydırdıysa veri tazelenince yerinden oynatılmaz
        onScrollBeginDrag={() => {
          userScrolled.current = true;
        }}
        initialNumToRender={12}
        windowSize={11}
        renderItem={({ item, index }) => {
          switch (item.kind) {
            case "level":
              return <LevelBanner level={item.level} label={item.label} state={item.state} />;
            case "unit":
              return <UnitHeader unitIndex={item.unitIndex} title={item.title} goal={item.goal} done={item.done} total={item.total} />;
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

      {/* SABİT BAŞLIK: opak zemin + marka ışığı; alttan yolun içine yumuşak solma */}
      <View pointerEvents="box-none" className="absolute inset-x-0 top-0" style={{ height: headerH + 24 }}>
        <View pointerEvents="none" className="absolute inset-x-0 top-0 overflow-hidden bg-canvas" style={{ height: headerH }}>
          {/* Işık başlığın alt kenarında TAM söner — kesilirse yolla arasında çizgi belirir */}
          <ScreenGlow height={headerH} />
        </View>
        <View pointerEvents="none" className="absolute inset-x-0" style={{ top: headerH, height: 24 }}>
          <FadeFill color={colors.canvas} from={1} to={0} />
        </View>
        <View pointerEvents="box-none" style={{ paddingTop: insets.top }}>
          <JourneyHero
            name={me?.profile?.displayName ?? ""}
            streak={stats?.streak ?? 0}
            title={placement?.lesson.title ?? tr.journey.levelDone}
            subtitle={ctx?.title ? `${curriculum.level} · ${ctx.title}` : `${curriculum.level} · ${curriculum.label}`}
            action={placement ? (placement.lesson.status === "in_progress" ? tr.journey.continue : tr.journey.start) : null}
            onPress={() => placement && openLesson(placement.lesson.id)}
            portrait={portrait}
            hero={hero}
          />
        </View>
      </View>
    </View>
  );
}

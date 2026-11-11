import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FadeFill } from "../../components/ui/FadeFill";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { Skeleton } from "../../components/ui/Skeleton";
import { CurriculumController } from "../../controllers/CurriculumController";
import { MeController } from "../../controllers/MeController";
import { tr } from "../../i18n/tr";
import {
  buildPathRows,
  indexAtOffset,
  initialRowIndex,
  rowContexts,
  rowHeight,
  rowOffsets,
  type NodeRect,
  type PathContext,
  type PathRow,
  type PathStop,
} from "../../lib/lessonPath";
import { useCurriculumStore } from "../../stores/useCurriculumStore";
import { useMeStore } from "../../stores/useMeStore";
import { useTabBarSpace } from "../../theme/layout";
import { useThemeColors } from "../../theme/useThemeColors";
import { HomeHeader } from "./HomeHeader";
import { LevelBanner } from "./LevelBanner";
import { NodePopover } from "./NodePopover";
import { PathTrack } from "./PathTrack";
import { TodayCard } from "./TodayCard";
import { UnitHeader } from "./UnitHeader";

/**
 * ANA EKRAN — MOBİL UI KURALI: kategori/jargon YOK, düz ders yolu.
 *
 * Yerleşim: üst katman (selam + seri + bugün kartı [+ kota]) SABİT; ders yolu
 * onun ALTINDAN kayar. Yol (11 Kas 2026, kullanıcı kararı): KIVRIMLI YOL — her
 * ünitede aynı kalıp (tek düğüm → yarım daire → çift düğüm → yarım daire …),
 * renkli dudaklı düğümler, adları altlarında; ünite testi büyük altın düğüm.
 * Ünite görselsiz bir başlıkla açılır; dokununca düğüm kartı. Başlık yükseklikleri SABİT (52/84/52): yolun
 * üst boşluğu = başlık yüksekliği olduğundan getItemLayout ölçüm beklemeden
 * kaldığı düğüme açılır.
 */

const HEADER_TOP = 52;
const CARD_H = 84;
const GAP = 10;

export function LessonsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { curriculum, error } = useCurriculumStore();
  const me = useMeStore((s) => s.me);
  const stats = useMeStore((s) => s.stats);

  // Sunumsal yerel durum: açık düğüm kartı (hangi satır, ekranda nerede)
  const [popover, setPopover] = useState<{ stop: PathStop; rect: NodeRect } | null>(null);

  // ODAKLANMADA tazele: sekme ekranı üstüne ders itildiğinde sökülmüyor — dönüşte
  // biten ders yeşile dönsün, bugünkü dakika güncellensin.
  useFocusEffect(
    useCallback(() => {
      void CurriculumController.getCurriculum();
      void MeController.loadStats();
      void MeController.load();
      return () => setPopover(null); // ekrandan çıkınca açık kart kalmasın
    }, []),
  );

  const rows = useMemo<PathRow[]>(() => (curriculum ? buildPathRows(curriculum) : []), [curriculum]);
  const offsets = useMemo(() => rowOffsets(rows), [rows]);
  const contexts = useMemo(() => rowContexts(rows), [rows]);
  const listRef = useRef<FlatList<PathRow>>(null);
  // Sunumsal yerel durum: kartta görünen bağlam (ardışık satırlar aynı nesneyi paylaşır)
  const [scrollCtx, setScrollCtx] = useState<PathContext | null>(null);

  const headerH = HEADER_TOP + GAP + CARD_H + 14;

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
        <Skeleton className="h-[52px] w-2/3 rounded-xl" />
        <Skeleton className="h-[84px] rounded-3xl" />
        <View className="items-center gap-10 pt-10">
          <Skeleton className="size-24 rounded-full" />
          <Skeleton className="size-24 -translate-x-12 rounded-full" />
          <Skeleton className="size-24 rounded-full" />
        </View>
      </View>
    );
  }

  const startIndex = initialRowIndex(rows, curriculum.level);
  const ctx = scrollCtx ?? contexts[startIndex] ?? null;
  const goal = me?.profile?.dailyGoalMinutes ?? 10;

  return (
    <View className="flex-1 bg-canvas">
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.key}
        showsVerticalScrollIndicator={false}
        // Güvenli alan + sabit başlık ÇALIŞMA ZAMANI değerleri — gerekçeli inline stil
        contentContainerStyle={{ paddingTop: insets.top + headerH, paddingBottom: bottom }}
        getItemLayout={(_, index) => ({ length: rowHeight(rows[index]!), offset: offsets[index] ?? 0, index })}
        initialScrollIndex={startIndex}
        onScrollToIndexFailed={() => {}}
        // Başlığın hemen altındaki satır, satır-uzayında tam contentOffset.y konumunda
        scrollEventThrottle={32}
        onScrollBeginDrag={() => setPopover(null)}
        onScroll={(e) => {
          const i = indexAtOffset(offsets, e.nativeEvent.contentOffset.y);
          const next = contexts[i];
          if (next) setScrollCtx((prev) => (prev === next ? prev : next));
        }}
        initialNumToRender={16}
        windowSize={11}
        renderItem={({ item }) =>
          item.kind === "level" ? (
            <LevelBanner level={item.level} label={item.label} state={item.state} />
          ) : item.kind === "unit" ? (
            <UnitHeader unitIndex={item.unitIndex} title={item.title} goal={item.goal} done={item.done} total={item.total} />
          ) : (
            <PathTrack row={item} onPress={(stop, rect) => setPopover({ stop, rect })} />
          )
        }
      />

      {/* Sabit başlık katmanı: opak zemin + alttan yolun içine yumuşak solma */}
      <View pointerEvents="box-none" className="absolute inset-x-0 top-0 z-10" style={{ height: insets.top + headerH + 24 }}>
        <View className="absolute inset-x-0 top-0 bg-canvas" style={{ height: insets.top + headerH - 14 }} />
        <View className="absolute inset-x-0" style={{ top: insets.top + headerH - 14, height: 38 }}>
          <FadeFill color={colors.canvas} from={1} to={0} />
        </View>
        <View className="gap-2.5 px-4" style={{ paddingTop: insets.top }}>
          <HomeHeader
            name={me?.profile?.displayName ?? ""}
            streak={stats?.streak ?? 0}
          />
          <TodayCard
            minutes={stats?.todayMinutes ?? 0}
            goal={goal}
            topLine={ctx ? `${ctx.level} · ${ctx.label}` : curriculum.label}
            title={ctx?.unitTitle || ctx?.label || curriculum.label}
            // Dokunuş: kaldığın derse geri kaydır — uzak seviyeye gezinmişken tek dokunuşla dönüş
            onPress={() => listRef.current?.scrollToIndex({ index: startIndex, animated: true })}
          />
        </View>
      </View>

      {popover?.stop.kind === "lesson" ? (
        <NodePopover
          rect={popover.rect}
          title={popover.stop.lesson.title}
          subtitle={tr.home.lessonOf(popover.stop.indexInUnit + 1, popover.stop.unitSize)}
          action={
            popover.stop.lesson.status === "completed"
              ? tr.home.actionReview
              : popover.stop.lesson.status === "in_progress"
                ? tr.home.actionContinue
                : tr.home.actionStart
          }
          onAction={() => {
            const id = popover.stop.kind === "lesson" ? popover.stop.lesson.id : "";
            setPopover(null);
            router.push(`/lesson/${id}`);
          }}
          onClose={() => setPopover(null)}
        />
      ) : popover?.stop.kind === "test" ? (
        <NodePopover
          rect={popover.rect}
          title={tr.home.unitTest(popover.stop.unitIndex)}
          subtitle={tr.home.testSub}
          action={popover.stop.state === "completed" ? tr.home.actionReview : tr.home.actionStart}
          onAction={() => {
            const s = popover.stop;
            setPopover(null);
            if (s.kind === "test") router.push(`/checkpoint/${s.level}/${s.unitIndex}`);
          }}
          onClose={() => setPopover(null)}
        />
      ) : null}
    </View>
  );
}

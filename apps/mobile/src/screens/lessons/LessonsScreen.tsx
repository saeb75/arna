import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CurriculumController } from "../../controllers/CurriculumController";
import { useCurriculumStore } from "../../stores/useCurriculumStore";
import {
  buildPathRows,
  indexAtOffset,
  initialRowIndex,
  rowContexts,
  rowHeight,
  rowOffsets,
  type PathContext,
  type PathRow,
} from "../../lib/lessonPath";
import { ContinueCard } from "./ContinueCard";
import { LessonsHeader } from "./LessonsHeader";
import { LessonRow } from "./LessonRow";
import { LevelBanner } from "./LevelBanner";
import { UnitMilestone } from "./UnitMilestone";

/**
 * ANA EKRAN — MOBİL UI KURALI (kök karar): kategori/jargon YOK, düz ders yolu.
 * "beat/core/checkpoint" gibi iç terimler ekranda görünmez; ünite testi satırı
 * "Ünite testi" der. Yol kıvrımlı bir S-eğrisidir: düğümler şeritlerde sağa-sola
 * salınır, ardışık düğümler eğriyle bağlıdır (bkz. lib/lessonPath.ts).
 *
 * Yerleşim: başlık (dil/seri pilleri + bağlam kartı) SABİT ve opak bir katman,
 * ders yolu onun ALTINDAN kayar.
 */

/** Sabit başlık katmanının yüksekliği + yolun ilk satırına bırakılan boşluk (pt) */
const HEADER_H_WITH_CARD = 134;
const HEADER_H_BARE = 62;
/** Yüzen sekme barının içerikten çaldığı alan */
const TAB_BAR_CLEARANCE = 110;

export function LessonsScreen() {
  const { curriculum, error } = useCurriculumStore();
  const insets = useSafeAreaInsets();

  // ODAKLANMADA tazele, mount'ta değil. Sekme ekranı, üstüne tam ekran ders ya
  // da ünite testi itildiğinde SÖKÜLMÜYOR; `useEffect(…, [])` geri dönüşte
  // yeniden koşmadığı için bitirilen ders yeşile dönmüyor, kazanılan rozet
  // görünmüyordu. Bekleme ekranı yalnız elde hiç veri yokken çıktığından
  // tazeleme göze çarpmaz.
  useFocusEffect(
    useCallback(() => {
      void CurriculumController.getCurriculum();
    }, []),
  );

  const rows = useMemo<PathRow[]>(() => (curriculum ? buildPathRows(curriculum) : []), [curriculum]);

  /** Satır yükseklikleri sabit → ölçüm beklemeden kaldığı düğüme kaydırabiliyoruz */
  const offsets = useMemo(() => rowOffsets(rows), [rows]);
  /** Satır → o an geçerli seviye/ünite (başlık kartı kaydırmayı bununla izler) */
  const contexts = useMemo(() => rowContexts(rows), [rows]);

  const listRef = useRef<FlatList<PathRow>>(null);
  // Sunumsal yerel durum (store kuralını bozmaz): kartta görünen bağlam.
  // rowContexts ardışık satırlarda AYNI nesneyi paylaşır → referans kıyası
  // yeter, kaydırma başına gereksiz render yok.
  const [scrollCtx, setScrollCtx] = useState<PathContext | null>(null);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="text-center text-sm text-danger">Dersler yüklenemedi ({error})</Text>
        <Pressable onPress={() => void CurriculumController.getCurriculum()}>
          <Text className="text-primary">Tekrar dene</Text>
        </Pressable>
      </View>
    );
  }

  // Yalnız ELDE VERİ YOKKEN tam ekran bekleme. Dersten dönünce müfredat yeniden
  // çekiliyor; o anda listeyi söküp takmak hem ekranı yakıp söndürüyor hem de
  // kullanıcının kaydırma konumunu sıfırlıyordu.
  if (!curriculum) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Yükleniyor…</Text>
      </View>
    );
  }

  const startIndex = initialRowIndex(rows, curriculum.level);
  const ctx = scrollCtx ?? contexts[startIndex] ?? null;
  const headerH = ctx ? HEADER_H_WITH_CARD : HEADER_H_BARE;

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.key}
        showsVerticalScrollIndicator={false}
        // Güvenli alan ÇALIŞMA ZAMANI değeri — NativeWind sınıfıyla ifade edilemez
        // (cihaza göre değişir), bu yüzden gerekçeli inline stil.
        contentContainerStyle={{
          paddingTop: insets.top + headerH,
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE,
        }}
        getItemLayout={(_, index) => ({
          length: rowHeight(rows[index]!),
          offset: offsets[index] ?? 0,
          index,
        })}
        initialScrollIndex={startIndex}
        // getItemLayout sabit yüksekliklerle çalışıyor; yine de listeyi kilitleme
        onScrollToIndexFailed={() => {}}
        // Başlık kartı kaydırmayı izler: paddingTop === başlık yüksekliği
        // olduğundan başlığın hemen altındaki satır, satır-uzayında tam
        // contentOffset.y konumundadır — ölçüm yok, ikili arama yeter.
        scrollEventThrottle={32}
        onScroll={(e) => {
          const i = indexAtOffset(offsets, e.nativeEvent.contentOffset.y);
          const next = contexts[i];
          if (next) setScrollCtx((prev) => (prev === next ? prev : next));
        }}
        // ~510 satırlık altı-seviye listesi derin initialScrollIndex ile açılıyor —
        // pencereyi dar tut ki açılışta yol boyu her düğüm render edilmesin
        initialNumToRender={16}
        windowSize={11}
        renderItem={({ item }) =>
          item.kind === "level" ? (
            <LevelBanner level={item.level} label={item.label} state={item.state} totals={item.totals} />
          ) : item.kind === "unit" ? (
            <UnitMilestone
              unitIndex={item.unitIndex}
              title={item.title}
              goal={item.goal}
              done={item.done}
              total={item.total}
              line={item.line}
              pos={item.pos}
            />
          ) : item.kind === "lesson" ? (
            <LessonRow
              kind={item.lesson.kind}
              label={item.lesson.title}
              state={item.state}
              line={item.line}
              pos={item.pos}
              onPress={() => router.push(`/lesson/${item.lesson.id}`)}
            />
          ) : (
            <LessonRow
              kind="test"
              label="Ünite testi"
              // Girilmiş test en iyi sonucunu gösterir; hazır test "hazır" der; gerisi sade
              sublabel={
                item.checkpoint
                  ? `En iyi ${item.checkpoint.bestScore}/${item.checkpoint.total}`
                  : item.state === "ready"
                    ? "Hazır"
                    : undefined
              }
              state={item.state}
              line={item.line}
              pos={item.pos}
              onPress={() => router.push(`/checkpoint/${item.level}/${item.unitIndex}`)}
            />
          )
        }
      />

      <View
        // Zemin OPAK: yoğun zaman çizgisinde altından kayan seviye kartı kesik
        // görünüyordu (eski zikzakta saydamlık pilleri göstermek içindi).
        className="absolute inset-x-0 top-0 z-10 bg-background px-4 pb-2"
        // insets.top cihaza göre değişir — gerekçeli inline stil (yukarıdaki notla aynı)
        style={{ paddingTop: insets.top }}
      >
        <LessonsHeader streak={0} />
        {ctx && (
          <ContinueCard
            topLine={`${ctx.level} · ${ctx.label}`}
            title={ctx.unitTitle || ctx.label}
            progress={ctx.progress}
            // Dokunuş: kaldığın derse geri kaydır — uzak seviyeye gezinmişken
            // tek dokunuşla dönüş. Ders yine düğümünden açılır.
            onPress={() => listRef.current?.scrollToIndex({ index: startIndex, animated: true })}
          />
        )}
      </View>
    </View>
  );
}

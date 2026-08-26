import { useCallback, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CurriculumController } from "../../controllers/CurriculumController";
import { useCurriculumStore } from "../../stores/useCurriculumStore";
import {
  buildPathRows,
  currentPlacement,
  initialRowIndex,
  rowHeight,
  rowOffsets,
  type PathRow,
} from "../../lib/lessonPath";
import { ContinueCard } from "./ContinueCard";
import { LessonsHeader } from "./LessonsHeader";
import { PathNode } from "./PathNode";
import { UnitPill } from "./UnitPill";

/**
 * ANA EKRAN — MOBİL UI KURALI (kök karar): kategori/jargon YOK, düz ders yolu.
 * "beat/core/checkpoint" gibi iç terimler ekranda görünmez; ünite testi düğümü
 * "Ünite testi" der.
 *
 * Yerleşim: başlık (dil/seri pilleri + devam kartı) SABİT bir katman, ders yolu
 * onun ALTINDAN kayar — tasarımda kartın üst boşluğunda arkadaki ünite pili
 * görünüyor, yani başlık opak zemin taşımıyor.
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
  const placement = useMemo(() => (curriculum ? currentPlacement(curriculum) : null), [curriculum]);

  /** Satır yükseklikleri sabit → ölçüm beklemeden kaldığı düğüme kaydırabiliyoruz */
  const offsets = useMemo(() => rowOffsets(rows), [rows]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="text-center text-sm text-red-400">Dersler yüklenemedi ({error})</Text>
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

  const headerH = placement ? HEADER_H_WITH_CARD : HEADER_H_BARE;

  return (
    <View className="flex-1 bg-background">
      <FlatList
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
        initialScrollIndex={initialRowIndex(rows)}
        // getItemLayout sabit yüksekliklerle çalışıyor; yine de listeyi kilitleme
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) =>
          item.kind === "unit" ? (
            <UnitPill title={item.title} />
          ) : item.kind === "lesson" ? (
            <PathNode
              kind={item.lesson.kind}
              label={item.lesson.title}
              state={item.state}
              side={item.side}
              onPress={() => router.push(`/lesson/${item.lesson.id}`)}
            />
          ) : (
            <PathNode
              kind="test"
              label={`Ünite ${item.unitIndex} testi`}
              state={item.state}
              side={item.side}
              onPress={() => router.push(`/checkpoint/${item.level}/${item.unitIndex}`)}
            />
          )
        }
      />

      <View
        className="absolute inset-x-0 top-0 z-10 px-4"
        // insets.top cihaza göre değişir — gerekçeli inline stil (yukarıdaki notla aynı)
        style={{ paddingTop: insets.top }}
      >
        <LessonsHeader streak={0} />
        {placement && (
          <ContinueCard
            level={curriculum.level}
            unitTitle={placement.unitTitle}
            lessonTitle={placement.lesson.title}
            onPress={() => router.push(`/lesson/${placement.lesson.id}`)}
          />
        )}
      </View>
    </View>
  );
}

import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { CurriculumController } from "../../controllers/CurriculumController";
import { useCurriculumStore } from "../../stores/useCurriculumStore";
import { AuthController } from "../../controllers/AuthController";

/**
 * Ders listesi — MOBİL UI KURALI (kök karar): kategori/jargon YOK, düz ders
 * yolu. Üniteler ayraç satırı, dersler tek sütun kart. "beat/core/checkpoint"
 * gibi iç terimler ekranda görünmez.
 */
export function LessonsScreen() {
  const { curriculum, loading, error } = useCurriculumStore();

  useEffect(() => {
    void CurriculumController.getCurriculum();
  }, []);

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

  if (loading || !curriculum) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Yükleniyor…</Text>
      </View>
    );
  }

  // Düz yol: üniteleri tek listeye ser — ünite başlığı ayraç, dersler kart
  const rows = curriculum.units.flatMap((unit) => [
    { kind: "unit" as const, key: `u${unit.index}`, title: unit.title },
    ...unit.lessons.map((l) => ({ kind: "lesson" as const, key: l.id, lesson: l })),
  ]);

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pb-2 pt-14">
        <View>
          <Text className="text-2xl font-bold text-white">Derslerin</Text>
          <Text className="text-xs text-muted">
            {curriculum.totals.completed}/{curriculum.totals.lessons} tamamlandı
          </Text>
        </View>
        <Pressable onPress={() => void AuthController.signOut()}>
          <Text className="text-sm text-muted">Çıkış</Text>
        </Pressable>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        contentContainerClassName="px-5 pb-10"
        renderItem={({ item }) =>
          item.kind === "unit" ? (
            <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-muted">
              {item.title}
            </Text>
          ) : (
            <Pressable
              onPress={() => router.push(`/lesson/${item.lesson.id}`)}
              className="mb-2 rounded-2xl bg-card p-4 active:opacity-80"
            >
              <Text className="text-base font-medium text-white">{item.lesson.title}</Text>
              {item.lesson.status === "completed" && (
                <Text className="mt-1 text-xs text-emerald-400">Tamamlandı ✓</Text>
              )}
            </Pressable>
          )
        }
      />
    </View>
  );
}

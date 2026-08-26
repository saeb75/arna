import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  checkpointPassed,
  gradeCheckpointItem,
  livesLeft,
  type Checkpoint,
  type CheckpointAnswer,
  type CheckpointItem,
} from "@arna/contracts";
import { Button } from "../../components/ui/Button";
import { CheckpointController } from "../../controllers/CheckpointController";
import { useCheckpointStore } from "../../stores/useCheckpointStore";
import { CheckpointResult } from "./CheckpointResult";
import { ChoiceItem } from "./ChoiceItem";
import { LivesRow } from "./LivesRow";
import { OrderItem } from "./OrderItem";

/**
 * ÜNİTE SONU TESTİ — dersin sohbet akışından KASITLI olarak farklı bir ekran.
 *
 * Derste cevap serbest metindir ve hoşgörü şarttır (LLM emniyet ağı). Burada
 * ÖLÇÜM yapılır: her maddenin tek doğru cevabı var, değerlendirme tamamen kodda
 * (`gradeCheckpointItem`, contracts) — LLM çağrısı, maliyet ve haksız ret yok.
 *
 * Sınav yanı: 3 can. Her yanlış bir can yakar, canlar bitince test orada düşer.
 * Geçme eşiği AYRI DEĞİL — `checkpointPassed` canların kendisinden türetir.
 * Kalmak hiçbir dersi kilitlemez (test kapı değil ayna); tek bedeli rozetin
 * gelmemesi.
 *
 * Geçici görünüm durumu (kaçıncı madde, seçim, kontrol edildi mi) BURADA
 * useState'te durur; store yalnız sunucudan gelen `Checkpoint`'i taşır.
 * CLAUDE.md'nin "durum store'da" kuralı controller'ın VERİ sahipliğiyle ilgili.
 */

const ERROR_TEXT: Record<string, string> = {
  not_enough_items: "Bu ünitenin dersleri henüz hazır değil.",
  unit_not_found: "Ünite bulunamadı.",
  no_profile: "Önce profilini oluşturman gerekiyor.",
};

function labelOf(item: CheckpointItem, labels: Checkpoint["labels"]): string {
  return item.kind === "mcq" ? labels.mcq : item.kind === "gap" ? labels.gap : labels.order;
}

export function CheckpointScreen({ level, unit }: { level: string; unit: string }) {
  const unitIndex = Number(unit);
  const insets = useSafeAreaInsets();
  const { checkpoint, loading, error, saveError } = useCheckpointStore();

  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  /** Yanlış sayısı — kalan can bundan TÜRER, ayrı sayaç tutulmaz */
  const [wrong, setWrong] = useState(0);
  const [weak, setWeak] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  // Açılışta yalnız çekilir: yerel durum zaten başlangıç değerlerinde, effect
  // içinde setState çağırmak gereksiz kademeli render üretir.
  useEffect(() => {
    void CheckpointController.getCheckpoint(level, unitIndex);
  }, [level, unitIndex]);

  /** "Yeni sorularla tekrar dene" — kullanıcı eylemi, durumu burada sıfırlıyoruz. */
  const retry = useCallback(() => {
    setIndex(0);
    setChoice(null);
    setBuilt([]);
    setChecked(false);
    setScore(0);
    setWrong(0);
    setWeak([]);
    setDone(false);
    void CheckpointController.getCheckpoint(level, unitIndex);
  }, [level, unitIndex]);

  const item = checkpoint?.items[index];

  const answer = useMemo<CheckpointAnswer | null>(() => {
    if (!item) return null;
    if (item.kind === "order") {
      return built.length === item.tokens.length
        ? { kind: "order", tokens: built.map((i) => item.tokens[i]!) }
        : null;
    }
    return choice === null ? null : { kind: "choice", index: choice };
  }, [item, choice, built]);

  const isCorrect = item && answer ? gradeCheckpointItem(item, answer) : false;

  const submit = useCallback(() => {
    if (!item || !answer || checked) return;
    setChecked(true);
    if (gradeCheckpointItem(item, answer)) {
      setScore((s) => s + 1);
      return;
    }
    setWrong((w) => w + 1);
    setWeak((w) => (w.includes(item.lessonId) ? w : [...w, item.lessonId]));
  }, [item, answer, checked]);

  /**
   * Canlar bitince test BURADA düşer — ama öğrenci cümlenin ortasında kesilmez:
   * `submit` o maddenin doğru cevabını zaten göstermiştir, bu buton ona basıldıktan
   * sonra çalışır. Sonuç iki durumda da kaydedilir; yarıda kalan deneme de bir
   * denemedir (zayıf ders verisi orada).
   */
  const next = useCallback(() => {
    if (!checkpoint) return;
    const outOfLives = livesLeft(wrong) === 0;
    if (!outOfLives && index + 1 < checkpoint.items.length) {
      setIndex((i) => i + 1);
      setChoice(null);
      setBuilt([]);
      setChecked(false);
      return;
    }
    setDone(true);
    void CheckpointController.saveResult(level, unitIndex, {
      score,
      // Cevaplanmayan maddeler yanlış sayılır: `total` madde sayısıdır.
      total: checkpoint.items.length,
      weakLessonIds: weak,
    });
  }, [checkpoint, index, level, unitIndex, score, weak, wrong]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text className="text-center text-sm text-red-400">{ERROR_TEXT[error] ?? "Test yüklenemedi."}</Text>
        <Button title="Derslere dön" variant="outline" onPress={() => router.replace("/lessons")} />
      </View>
    );
  }

  if (loading || !checkpoint) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Test hazırlanıyor…</Text>
      </View>
    );
  }

  if (done) {
    return (
      // Güvenli alan çalışma zamanı değeri — gerekçeli inline stil
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
        <CheckpointResult
          unitIndex={checkpoint.unitIndex}
          passed={checkpointPassed(score, checkpoint.items.length)}
          score={score}
          total={checkpoint.items.length}
          weakLessonIds={weak}
          saveError={saveError}
          onRetry={retry}
        />
      </View>
    );
  }

  if (!item) return null;

  const progress = ((index + (checked ? 1 : 0)) / checkpoint.items.length) * 100;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}>
      <View className="flex-row items-center gap-3 px-4">
        <Pressable onPress={() => router.replace("/lessons")} accessibilityLabel="Çık" hitSlop={12}>
          <Text className="text-lg text-muted">✕</Text>
        </Pressable>
        <View className="h-2 flex-1 overflow-hidden rounded-full bg-card">
          {/* Genişlik yüzdesi ÇALIŞMA ZAMANI değeri — NativeWind sınıfıyla ifade edilemez */}
          <View className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </View>
        <LivesRow left={livesLeft(wrong)} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-6 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm font-medium text-muted">{labelOf(item, checkpoint.labels)}</Text>

        {item.kind === "order" ? (
          <OrderItem item={item} built={built} checked={checked} onChange={setBuilt} />
        ) : (
          <ChoiceItem item={item} choice={choice} checked={checked} onChoose={setChoice} />
        )}

        {checked && (
          <View className={`rounded-xl p-4 ${isCorrect ? "bg-success/10" : "bg-red-500/10"}`}>
            <Text className={`text-sm font-medium ${isCorrect ? "text-success" : "text-red-400"}`}>
              {isCorrect ? "Doğru!" : "Doğrusu:"}
            </Text>
            {!isCorrect && (
              <Text className="mt-1 text-sm text-white">
                {item.kind === "order" ? item.answer.join(" ") : item.options[item.correctIndex]}
              </Text>
            )}
            {item.kind === "mcq" && choice !== null && item.optionFeedback?.[choice] && (
              <Text className="mt-1 text-sm text-muted">{item.optionFeedback[choice]}</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View className="px-4">
        <Button
          title={
            checked
              ? livesLeft(wrong) === 0 || index + 1 === checkpoint.items.length
                ? "Bitir"
                : "Devam"
              : "Kontrol et"
          }
          disabled={!answer}
          onPress={checked ? next : submit}
        />
      </View>
    </View>
  );
}

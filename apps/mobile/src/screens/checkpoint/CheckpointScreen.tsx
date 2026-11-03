import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { X } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  checkpointPassed,
  gradeCheckpointItem,
  livesLeft,
  type Checkpoint,
  type CheckpointAnswer,
  type CheckpointItem,
} from "@glotmate/contracts";
import { CtaButton } from "../../components/ui/CtaButton";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { Skeleton } from "../../components/ui/Skeleton";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";
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
  not_enough_items: tr.errors.unitNotReady,
  unit_not_found: tr.errors.unitNotReady,
};

function labelOf(item: CheckpointItem, labels: Checkpoint["labels"]): string {
  return item.kind === "mcq" ? labels.mcq : item.kind === "gap" ? labels.gap : labels.order;
}

export function CheckpointScreen({ level, unit }: { level: string; unit: string }) {
  const unitIndex = Number(unit);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
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
      HapticsService.success();
      setScore((s) => s + 1);
      return;
    }
    HapticsService.warning();
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
      <View className="flex-1 justify-center gap-4 bg-canvas px-6">
        <LoadFailed body={ERROR_TEXT[error]} onRetry={retry} />
        <CtaButton label={tr.checkpoint.backToLessons} onPress={() => router.replace("/lessons")} />
      </View>
    );
  }

  if (loading || !checkpoint) {
    return (
      // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
      <View className="flex-1 gap-4 bg-canvas px-4" style={{ paddingTop: insets.top + 16 }}>
        <Skeleton className="h-10 rounded-full" />
        <Skeleton className="mt-6 h-8 w-4/5 rounded-xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </View>
    );
  }

  if (done) {
    return (
      // Güvenli alan çalışma zamanı değeri — gerekçeli inline stil
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
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

  const progress = (index + (checked ? 1 : 0)) / checkpoint.items.length;

  return (
    // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 12 }}>
      <View className="h-14 flex-row items-center gap-3 px-4">
        <RoundIconButton variant="muted" icon={<X color={colors.foreground} size={20} />} label={tr.checkpoint.exit} onPress={() => router.replace("/lessons")} />
        <View className="flex-1">
          <ProgressBar value={progress} className="h-2.5" />
        </View>
        <LivesRow left={livesLeft(wrong)} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-6 pt-6" keyboardShouldPersistTaps="handled">
        <Animated.Text key={`l${index}`} entering={FadeInDown.duration(300)} className="text-xs font-bold tracking-widest text-brand">
          {labelOf(item, checkpoint.labels).toLocaleUpperCase("tr")}
        </Animated.Text>

        <Animated.View key={`i${index}`} entering={FadeInDown.delay(60).duration(380)}>
          {item.kind === "order" ? (
            <OrderItem item={item} built={built} checked={checked} onChange={setBuilt} />
          ) : (
            <ChoiceItem item={item} choice={choice} checked={checked} onChoose={setChoice} />
          )}
        </Animated.View>
      </ScrollView>

      {checked && (
        <Animated.View entering={FadeInDown.duration(280)} className={`mx-4 mb-3 gap-1 rounded-3xl p-4 ${isCorrect ? "bg-positive/10" : "bg-negative/10"}`}>
          <Text className={`text-base font-bold ${isCorrect ? "text-positive" : "text-negative"}`}>
            {isCorrect ? tr.checkpoint.correct : tr.checkpoint.answerWas}
          </Text>
          {!isCorrect && (
            <Text className="text-base text-foreground">
              {item.kind === "order" ? item.answer.join(" ") : item.options[item.correctIndex]}
            </Text>
          )}
          {item.kind === "mcq" && choice !== null && item.optionFeedback?.[choice] && (
            <Text className="text-sm text-muted-foreground">{item.optionFeedback[choice]}</Text>
          )}
        </Animated.View>
      )}

      <View className="px-4">
        <CtaButton
          label={
            checked
              ? livesLeft(wrong) === 0 || index + 1 === checkpoint.items.length
                ? tr.checkpoint.finish
                : tr.checkpoint.next
              : tr.checkpoint.check
          }
          disabled={!answer}
          onPress={checked ? next : submit}
        />
      </View>
    </View>
  );
}

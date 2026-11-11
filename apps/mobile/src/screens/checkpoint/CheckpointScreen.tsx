import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { X } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  checkpointDrillOf,
  checkpointPassed,
  gradeCheckpointItem,
  livesLeft,
  type DrillAnswer,
} from "@glotmate/contracts";
import { DrillCard } from "../../components/shared/drills/DrillCard";
import { DrillHostProvider, type DrillHostValue } from "../../components/shared/drills/DrillHost";
import { CtaButton } from "../../components/ui/CtaButton";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { Skeleton } from "../../components/ui/Skeleton";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { SoundService } from "../../services/SoundService";
import { useThemeColors } from "../../theme/useThemeColors";
import { CheckpointController } from "../../controllers/CheckpointController";
import { useCheckpointStore } from "../../stores/useCheckpointStore";
import { CheckpointResult } from "./CheckpointResult";
import { LivesRow } from "./LivesRow";

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
 * OYUN MADDELERİYLE (10 Kas 2026, kullanıcı kararı): test de ders gibi oynanır —
 * ünitenin derslerinden karışık oyun türleri, dersteki AYNI bileşenlerle
 * (`components/shared/drills`). Testte ipucu yok: dokun-çevir, "Konuyu hatırla" ve
 * konuşma kartı yok; dinleme maddesinin sesi oturumsuz uçtan gelir.
 *
 * Geçici görünüm durumu (kaçıncı madde, kontrol sonucu, puan) BURADA useState'te
 * durur; seçim/kart durumu DrillCard'ın içinde; store sunucu verisini taşır.
 * CLAUDE.md'nin "durum store'da" kuralı controller'ın VERİ sahipliğiyle ilgili.
 */

const ERROR_TEXT: Record<string, string> = {
  not_enough_items: tr.errors.unitNotReady,
  unit_not_found: tr.errors.unitNotReady,
};

export function CheckpointScreen({ level, unit }: { level: string; unit: string }) {
  const unitIndex = Number(unit);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { checkpoint, loading, error, saveError, speaking } = useCheckpointStore();

  const [index, setIndex] = useState(0);
  /** Kontrol edilen maddenin sonucu (null = henüz kontrol edilmedi) */
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  /** Yanlış sayısı — kalan can bundan TÜRER, ayrı sayaç tutulmaz */
  const [wrong, setWrong] = useState(0);
  const [weak, setWeak] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  // Açılışta yalnız çekilir; çıkışta ses susar
  useEffect(() => {
    void CheckpointController.getCheckpoint(level, unitIndex);
    return () => CheckpointController.stopAudio();
  }, [level, unitIndex]);

  const item = checkpoint?.items[index];
  const drill = useMemo(() => (item ? checkpointDrillOf(item) : null), [item]);

  // Dinleme maddesi ekrana gelince ses kendiliğinden çalar (derste olduğu gibi)
  useEffect(() => {
    if (drill?.type === "listen_choose" || drill?.type === "listen_arrange") CheckpointController.play(drill.audio);
  }, [drill]);

  /** "Yeni sorularla tekrar dene" — kullanıcı eylemi, durumu burada sıfırlıyoruz. */
  const retry = useCallback(() => {
    setIndex(0);
    setVerdict(null);
    setScore(0);
    setWrong(0);
    setWeak([]);
    setDone(false);
    void CheckpointController.getCheckpoint(level, unitIndex);
  }, [level, unitIndex]);

  const check = useCallback(
    (answer: DrillAnswer) => {
      if (!item || verdict !== null) return;
      CheckpointController.stopAudio();
      const ok = gradeCheckpointItem(item, { kind: "drill", answer });
      setVerdict(ok);
      if (ok) {
        HapticsService.success();
        SoundService.correct();
        setScore((s) => s + 1);
        return;
      }
      HapticsService.warning();
      SoundService.wrong();
      setWrong((w) => w + 1);
      setWeak((w) => (w.includes(item.lessonId) ? w : [...w, item.lessonId]));
    },
    [item, verdict],
  );

  /**
   * Canlar bitince test BURADA düşer — ama öğrenci maddenin ortasında kesilmez: panel o
   * maddenin doğrusunu zaten göstermiştir, bu buton ona basıldıktan sonra çalışır.
   * Sonuç iki durumda da kaydedilir; yarıda kalan deneme de bir denemedir.
   */
  const next = useCallback(() => {
    if (!checkpoint) return;
    CheckpointController.stopAudio();
    const outOfLives = livesLeft(wrong) === 0;
    if (!outOfLives && index + 1 < checkpoint.items.length) {
      setIndex((i) => i + 1);
      setVerdict(null);
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

  const last = !!checkpoint && (livesLeft(wrong) === 0 || index + 1 === checkpoint.items.length);
  const host = useMemo<DrillHostValue>(
    () => ({
      play: (text) => CheckpointController.play(text),
      speaking,
      check,
      next,
      continueLabel: last ? tr.checkpoint.finish : tr.checkpoint.next,
      feedbackFor: (choice) => {
        if (!item || choice === null) return null;
        return (item.kind === "drill" || item.kind === "mcq" ? item.optionFeedback?.[choice] : null) || null;
      },
    }),
    [speaking, check, next, last, item],
  );

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

  if (!item || !drill) return null;

  const progress = (index + (verdict !== null ? 1 : 0)) / checkpoint.items.length;
  const key = `${item.id}-${index}`;

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

      <Animated.View key={`h${key}`} entering={FadeInDown.duration(300)} className="gap-1 px-5 pb-3 pt-4">
        <Text className="text-xs font-bold tracking-widest text-brand">{tr.drill.eyebrow(index + 1, checkpoint.items.length)}</Text>
        <Text className="text-xl font-bold tracking-tight text-foreground">{tr.drill.instruction[drill.type]}</Text>
      </Animated.View>

      <DrillHostProvider value={host}>
        <DrillCard key={key} item={drill} itemKey={key} verdictOk={verdict} />
      </DrillHostProvider>
    </View>
  );
}

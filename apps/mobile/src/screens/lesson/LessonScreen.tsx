import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageBubble } from "../../components/shared/MessageBubble";
import { NoticeBar } from "../../components/shared/NoticeBar";
import { CtaButton } from "../../components/ui/CtaButton";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { Skeleton } from "../../components/ui/Skeleton";
import { LessonSessionController } from "../../controllers/LessonSessionController";
import { tr } from "../../i18n/tr";
import { useLessonSessionStore } from "../../stores/useLessonSessionStore";
import { CaptionCard } from "./CaptionCard";
import { HintCard } from "./HintCard";
import { LessonDock } from "./LessonDock";
import { LessonStage } from "./LessonStage";
import { LessonStart } from "./LessonStart";
import { LessonTopBar } from "./LessonTopBar";
import { lessonProgress } from "./lessonProgress";
import { TaskCard } from "./TaskCard";
import { TranscriptSheet } from "./TranscriptSheet";

/**
 * DERS EKRANI — yalnız store'dan okur, yalnız controller çağırır (CLAUDE.md).
 * Akış makinesi LessonSessionController'da; burada tek bir karar bile yok.
 * Bu dosya SUNUMDUR: değişmezler korunur — girdi kilidi `busy || grace`,
 * basılı mikrofon asla disabled, MCQ yalnız `exercise+choice`, "Dersi Bitir"
 * yalnız wrapup, ✕ = exit() (bitirme DEĞİL).
 *
 * Düzen (5 Kas 2026, kullanıcı kararı): avatar solda küçük 2:3 kart, altında
 * dersin TÜM konuşması kaydırılabilir akış — eski "yalnız o anki söz" düzeninde
 * geçmişi görmek için Transkript sheet'ine dokunmak gerekiyordu. O anki görev
 * kartı akışta kendi sorusunun yerinde durur (MCQ şıkları içinde). Yeni söz
 * düşünce akış yalnız kullanıcı zaten en alttaysa kayar — geçmişi okurken
 * aşağı çekilmez. Görev/anlatım ayrımı yalnız sunumdur, akışa girmez.
 */
export function LessonScreen({ catalogLessonId }: { catalogLessonId: string }) {
  const insets = useSafeAreaInsets();
  const {
    lesson, loadError, started, phase, beatIndex, awaiting, practiceTurn, avatarId,
    messages, promptMessageId, hint, notice, speaking, recording, busy, grace, resume,
  } = useLessonSessionStore();
  const scrollRef = useRef<ScrollView>(null);
  // Kullanıcı en alttaysa yeni söz akışı kaydırır; yukarıda geçmişi okurken kaydırmaz
  const atBottomRef = useRef(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    void LessonSessionController.open(catalogLessonId);
    return () => LessonSessionController.leave(); // çıkışta sesi sustur
  }, [catalogLessonId]);

  const beat = lesson?.lecture.beats[beatIndex];
  const task = phase === "lecture" && (beat?.kind === "exercise" || beat?.kind === "open_response");

  const lastId = messages.at(-1)?.id ?? null;
  useEffect(() => {
    if (!atBottomRef.current) return;
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [lastId, messages.length, hint, task]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    atBottomRef.current = contentOffset.y + layoutMeasurement.height >= contentSize.height - 48;
  };

  if (loadError) {
    return (
      <View className="flex-1 justify-center gap-4 bg-canvas px-6">
        <LoadFailed
          body={loadError === "lesson_not_ready" ? tr.errors.lessonNotReady : undefined}
          onRetry={() => void LessonSessionController.open(catalogLessonId)}
        />
        <CtaButton label={tr.common.back} onPress={() => router.back()} />
      </View>
    );
  }

  if (!lesson) {
    return (
      // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
      <View className="flex-1 gap-4 bg-canvas px-6" style={{ paddingTop: insets.top + 80 }}>
        <Skeleton className="size-20 rounded-3xl" />
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-10 w-4/5 rounded-xl" />
        <Skeleton className="h-6 w-3/5 rounded-xl" />
      </View>
    );
  }

  if (!started) {
    return (
      <LessonStart
        // Ders adı İngilizce (katalog başlığı) — ders yolundaki adla aynı (4 Kas 2026 kararı)
        title={lesson.titleEn}
        theme={lesson.theme}
        hasResume={!!resume}
        busy={busy}
        onStart={() => void LessonSessionController.start()}
        onResume={() => LessonSessionController.resume()}
        onRestart={() => void LessonSessionController.restart()}
      />
    );
  }

  /**
   * GİRDİ KİLİDİ — TEK kaynak. Konuşma sırasında girdi AÇIK (söz kesme).
   * Kapalı kaldığı iki durum: sunucu düşünüyor (busy) ya da metin yeni düştü
   * ve okuması için yarım saniye tanınıyor (grace).
   */
  const inputLocked = busy || grace;
  const choice = beat?.kind === "exercise" && beat.answerSpec.kind === "choice" && beat.options?.length ? beat.options : null;
  const taskBeats = lesson.lecture.beats.filter((b) => b.kind === "exercise" || b.kind === "open_response");
  const ordinal = lesson.lecture.beats.slice(0, beatIndex + 1).filter((b) => b.kind === "exercise" || b.kind === "open_response").length;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-canvas">
      {/* Üst güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil */}
      <View style={{ paddingTop: insets.top }}>
        <LessonTopBar
          progress={lessonProgress(lesson, phase, beatIndex, practiceTurn)}
          onClose={() => LessonSessionController.confirmExit()}
          onHint={() => LessonSessionController.showHint()}
        />
      </View>

      <LessonStage
        speaking={speaking}
        avatarId={avatarId}
        activity={recording ? "listening" : busy && !speaking ? "thinking" : "idle"}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-4"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={64}
        // İçerik büyüdüğünde (yeni söz, uzun anlatım) en alttaysak altta kal
        onContentSizeChange={() => {
          if (atBottomRef.current) scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {messages.map((m) => {
          // O anki görevin sorusu: görev kartı (MCQ şıkları dahil) — geçmiş görevler düz söz
          if (task && beat && (beat.kind === "exercise" || beat.kind === "open_response") && m.id === promptMessageId) {
            return (
              <TaskCard
                key={m.id}
                ordinal={ordinal}
                total={taskBeats.length}
                prompt={beat.runs}
                options={choice}
                // MCQ yalnız soru sorulduktan SONRA dokunulur (awaiting exercise) — eski kural
                locked={inputLocked || awaiting !== "exercise"}
                onSelect={(opt) => LessonSessionController.submitOption(opt)}
              />
            );
          }
          if (m.role === "user") return <MessageBubble key={m.id} role="user" text={m.text} runs={m.runs} />;
          if (!m.text.trim() && !m.points?.length && !m.runs?.length) return null;
          // Akan yazı yalnız EN YENİ sözde (geçmiş anında görünür; animate bağlanışta okunur)
          return <CaptionCard key={m.id} message={m} animate={m.id === lastId} />;
        })}
      </ScrollView>

      {hint && <HintCard hint={hint} label={lesson.ui.labels.hint} />}
      {notice && <NoticeBar text={notice} />}
      {phase === "wrapup" && (
        <Animated.View entering={FadeInDown.duration(320)} className="px-4 pb-1 pt-2">
          <CtaButton label={tr.lesson.finish} onPress={() => void LessonSessionController.finish()} />
        </Animated.View>
      )}

      <LessonDock
        locked={inputLocked}
        recording={recording}
        placeholder={inputLocked ? tr.lesson.thinking : awaiting ? tr.lesson.placeholderAnswer : tr.lesson.placeholderBarge}
        onSend={(t) => void LessonSessionController.handleUserText(t)}
        onPressMic={() => void LessonSessionController.pressMic()}
        onReleaseMic={() => void LessonSessionController.releaseMic()}
        onTranscript={() => setTranscriptOpen(true)}
      />

      <TranscriptSheet visible={transcriptOpen} messages={messages} onClose={() => setTranscriptOpen(false)} />
    </KeyboardAvoidingView>
  );
}

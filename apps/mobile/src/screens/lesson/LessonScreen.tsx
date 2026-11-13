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
import { useLessonSessionStore, type LessonMessage } from "../../stores/useLessonSessionStore";
import { CaptionCard } from "./CaptionCard";
import { HintCard } from "./HintCard";
import { LessonDock } from "./LessonDock";
import { LessonStage, STAGE_SIZE } from "./LessonStage";
import { LessonStart } from "./LessonStart";
import { LessonTopBar } from "./LessonTopBar";
import { lessonProgress } from "./lessonProgress";
import { TaskCard } from "./TaskCard";
import { TranscriptSheet } from "./TranscriptSheet";
import { PracticeTargets } from "./PracticeTargets";
import { DrillStage } from "./drills/DrillStage";

/**
 * DERS EKRANI — yalnız store'dan okur, yalnız controller çağırır (CLAUDE.md).
 * Akış makinesi LessonSessionController'da; burada tek bir karar bile yok.
 * Bu dosya SUNUMDUR: değişmezler korunur — girdi kilidi `busy || grace`,
 * basılı mikrofon asla disabled, MCQ yalnız `exercise+choice`, "Dersi Bitir"
 * yalnız wrapup, ✕ = exit() (bitirme DEĞİL).
 *
 * Düzen (5 Kas 2026; 12 Kas 2026'da avatar sağ üst köşeye yüzen karta geçti, ad/durum
 * satırı kalktı, ilk söz avatarın yanına sığar, gerisi altından akar): dersin TÜM konuşması kaydırılabilir akış — eski "yalnız o anki söz" düzeninde
 * geçmişi görmek için Transkript sheet'ine dokunmak gerekiyordu. O anki görev
 * kartı akışta kendi sorusunun yerinde durur (MCQ şıkları içinde). Yeni söz
 * düşünce akış yalnız kullanıcı zaten en alttaysa kayar — geçmişi okurken
 * aşağı çekilmez. Görev/anlatım ayrımı yalnız sunumdur, akışa girmez.
 */
export function LessonScreen({ catalogLessonId }: { catalogLessonId: string }) {
  const insets = useSafeAreaInsets();
  const {
    lesson, loadError, started, phase, beatIndex, awaiting, practiceTurn, avatarId, tutorName,
    messages, promptMessageId, hint, notice, speaking, recording, busy, grace, resume, drill, practiceUsed,
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
  /**
   * OYUN BLOĞU: sohbet akışı ve rıhtım yerini alıştırma sahnesine bırakır; avatar
   * küçülür. Blok bitip rol yapma başlayınca (afterDrills → awaiting null) akış geri gelir.
   */
  const drills = phase === "lecture" && beat?.kind === "drills" && awaiting === "drills" ? beat.items : null;

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
        tutorName={tutorName}
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

  const isTaskPrompt = (m: LessonMessage) =>
    !!task && !!beat && (beat.kind === "exercise" || beat.kind === "open_response") && m.id === promptMessageId;
  // Ekranda bir şey çizen sözler — ilki avatarın yanına yerleşir
  const visible = messages.filter(
    (m) => isTaskPrompt(m) || m.role === "user" || m.text.trim() || m.points?.length || m.runs?.length,
  );
  const renderMessage = (m: LessonMessage) => {
    // O anki görevin sorusu: görev kartı (MCQ şıkları dahil) — geçmiş görevler düz söz
    if (isTaskPrompt(m) && beat && (beat.kind === "exercise" || beat.kind === "open_response")) {
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
    // Akan yazı yalnız EN YENİ sözde (geçmiş anında görünür; animate bağlanışta okunur)
    return <CaptionCard key={m.id} message={m} animate={m.id === lastId} />;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-canvas">
      {/* Üst güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil */}
      <View style={{ paddingTop: insets.top }}>
        <LessonTopBar
          progress={lessonProgress(lesson, phase, beatIndex, practiceTurn, drill)}
          onClose={() => LessonSessionController.confirmExit()}
          onHint={() => LessonSessionController.showHint()}
        />
      </View>

      {phase === "practice" && <PracticeTargets phrases={lesson.practice.mustUse} used={practiceUsed} />}

      <View className="flex-1">
        {drills ? (
          // Alt güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil (rıhtım yokken CTA'yı korur).
          // Üst boşluk = köşedeki küçük avatar (96) + aralık
          <Animated.View key="drills" entering={FadeInDown.duration(380)} className="flex-1 pt-[108px]" style={{ paddingBottom: insets.bottom + 8 }}>
            <DrillStage items={drills} />
            {notice && <NoticeBar text={notice} />}
          </Animated.View>
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="gap-3 px-4 pb-4 pt-1"
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={64}
            // İçerik büyüdüğünde (yeni söz, uzun anlatım) en alttaysak altta kal
            onContentSizeChange={() => {
              if (atBottomRef.current) scrollRef.current?.scrollToEnd({ animated: true });
            }}
          >
            {visible.map((m, i) => {
              const el = renderMessage(m);
              // İlk söz sağ üstteki avatarın YANINA sığar; sonraki sözler avatarın altından tam genişlik akar.
              // Ölçü avatar kartından gelir — gerekçeli inline stil
              return i === 0 ? (
                <View key={m.id} style={{ marginRight: STAGE_SIZE.width + 12, minHeight: STAGE_SIZE.height }}>
                  {el}
                </View>
              ) : (
                el
              );
            })}
          </ScrollView>
        )}

        {/* Avatar SAĞ ÜST köşede yüzer (12 Kas 2026, kullanıcı kararı) — ad/durum satırı yok, yanındaki
            alan konuşmaya kalır. Ağaçta TEK yerde: oyun bloğuna geçişte yeniden bağlanmaz (3D WebView yeniden yüklenmesin).
            Dokunuşu yutmaz — altından kaydırma çalışır */}
        <View pointerEvents="none" className="absolute right-4 top-1">
          <LessonStage
            speaking={speaking}
            avatarId={avatarId}
            tutorName={tutorName}
            activity={recording ? "listening" : busy && !speaking ? "thinking" : "idle"}
            compact={!!drills}
          />
        </View>
      </View>

      {!drills && (
        <>
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
          placeholder={inputLocked ? tr.lesson.thinking(tutorName) : awaiting ? tr.lesson.placeholderAnswer : tr.lesson.placeholderBarge(tutorName)}
          tutorName={tutorName}
          onSend={(t) => void LessonSessionController.handleUserText(t)}
          onPressMic={() => void LessonSessionController.pressMic()}
          onReleaseMic={() => void LessonSessionController.releaseMic()}
          onTranscript={() => setTranscriptOpen(true)}
        />

        </>
      )}

      <TranscriptSheet visible={transcriptOpen} messages={messages} onClose={() => setTranscriptOpen(false)} />
    </KeyboardAvoidingView>
  );
}

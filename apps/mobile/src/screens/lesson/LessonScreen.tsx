import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageBubble } from "../../components/shared/MessageBubble";
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
 * Düzen (3 Kas 2026, kullanıcı kararı — sohbet duvarı emekli): anlatımda
 * GÖRÜNTÜLÜ GÖRÜŞME — büyük avatar + yalnız o anki söz (altyazı kartı);
 * alıştırmada avatar köşeye küçülür, GÖREV KARTI ortaya gelir. Geçmişin tamamı
 * Transkript sheet'inde. Mod seçimi yalnız sunumdur (beat tipi), akışa girmez.
 */
export function LessonScreen({ catalogLessonId }: { catalogLessonId: string }) {
  const insets = useSafeAreaInsets();
  const {
    lesson, loadError, started, phase, beatIndex, awaiting, practiceTurn, avatarId,
    messages, promptMessageId, hint, speaking, recording, busy, grace, resume,
  } = useLessonSessionStore();
  const scrollRef = useRef<ScrollView>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    void LessonSessionController.open(catalogLessonId);
    return () => LessonSessionController.leave(); // çıkışta sesi sustur
  }, [catalogLessonId]);

  const beat = lesson?.lecture.beats[beatIndex];
  const task = phase === "lecture" && (beat?.kind === "exercise" || beat?.kind === "open_response");

  // Ekrandaki pencere: görevde soru balonundan sonrası (cevaplar + geri bildirim),
  // anlatımda son hoca sözü + varsa ondan sonraki öğrenci sözü.
  const promptIndex = promptMessageId ? messages.findIndex((m) => m.id === promptMessageId) : -1;
  const afterPrompt = task && promptIndex >= 0 ? messages.slice(promptIndex + 1) : [];
  let lastTeacherIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]!.role === "teacher") {
      lastTeacherIndex = i;
      break;
    }
  }
  const lastTeacher = lastTeacherIndex >= 0 ? messages[lastTeacherIndex]! : null;
  const userAfter = messages.slice(lastTeacherIndex + 1).filter((m) => m.role === "user").at(-1) ?? null;
  const userAfterId = userAfter?.id ?? null;

  useEffect(() => {
    // Yeni söz düştüğünde: anlatımda kartın BAŞINA (maddeler yukarıdan okunur),
    // öğrenci sözü ya da görev geri bildiriminde dibe
    const t = setTimeout(() => {
      if (!task && !userAfterId) scrollRef.current?.scrollTo({ y: 0, animated: true });
      else scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [task, lastTeacher?.id, userAfterId, afterPrompt.length, hint]);

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
        title={lesson.title}
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
        compact={task}
        speaking={speaking}
        avatarId={avatarId}
        activity={recording ? "listening" : busy && !speaking ? "thinking" : "idle"}
      />

      <ScrollView ref={scrollRef} className="flex-1" contentContainerClassName="gap-3 px-4 pb-4" showsVerticalScrollIndicator={false}>
        {task && beat && (beat.kind === "exercise" || beat.kind === "open_response") ? (
          <>
            <TaskCard
              key={beat.id}
              ordinal={ordinal}
              total={taskBeats.length}
              prompt={beat.runs}
              options={choice}
              // MCQ yalnız soru sorulduktan SONRA dokunulur (awaiting exercise) — eski kural
              locked={inputLocked || awaiting !== "exercise"}
              onSelect={(opt) => LessonSessionController.submitOption(opt)}
            />
            {afterPrompt.map((m) =>
              m.role === "user" ? (
                <MessageBubble key={m.id} role="user" text={m.text} runs={m.runs} />
              ) : (
                <CaptionCard key={m.id} message={m} />
              ),
            )}
          </>
        ) : (
          <>
            {lastTeacher ? <CaptionCard message={lastTeacher} /> : null}
            {userAfter ? <MessageBubble role="user" text={userAfter.text} runs={userAfter.runs} /> : null}
          </>
        )}
      </ScrollView>

      {hint && <HintCard hint={hint} label={lesson.ui.labels.hint} />}
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

import { useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvatarStage } from "../../components/shared/AvatarStage";
import { InputDock } from "../../components/shared/InputDock";
import { MessageBubble } from "../../components/shared/MessageBubble";
import { NoticeBar } from "../../components/shared/NoticeBar";
import { Skeleton } from "../../components/ui/Skeleton";
import { ReviewSheet } from "../../components/shared/ReviewSheet";
import { UserTurn } from "../../components/shared/UserTurn";
import { WordCard } from "../../components/shared/WordCard";
import { NotebookController } from "../../controllers/NotebookController";
import { RoleplaySessionController } from "../../controllers/RoleplaySessionController";
import { tr } from "../../i18n/tr";
import { useRoleplaySessionStore } from "../../stores/useRoleplaySessionStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { DebriefView } from "./DebriefView";
import { ObjectiveChip } from "./ObjectiveChip";
import { PlayTopBar } from "./PlayTopBar";

/**
 * ROL YAPMA — oyun ekranı. Yalnız store'dan okur, yalnız controller çağırır.
 * Bitiren YALNIZ "Bitir"; ✕ denemeyi kaydetmeden çıkar. Girdi kilidi `busy || grace`.
 */
export function RoleplayPlayScreen({ slug }: { slug: string }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const s = useRoleplaySessionStore();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    void RoleplaySessionController.prepare(slug);
    return () => RoleplaySessionController.leave();
  }, [slug]);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [s.messages.length]);

  // Oturumsuz gelindiyse (geri yüklenen rota) brief'e dön — oturumu yalnız "Başla" açar
  useEffect(() => {
    if (s.phase === "idle" && !s.session) router.replace(`/roleplay/${slug}`);
  }, [s.phase, s.session, slug]);

  if (!s.session) {
    // "Tekrar oyna": yeni oturum açılırken aynı ekranda kısa bekleme
    return (
      // Güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
      <View className="flex-1 gap-4 bg-canvas px-5" style={{ paddingTop: insets.top + 24 }}>
        {s.phase === "opening" ? (
          <>
            <Skeleton className="h-10 w-2/3 rounded-xl" />
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-16 w-4/5 rounded-3xl" />
          </>
        ) : null}
      </View>
    );
  }

  const objectives = s.session.objectives.map((o) => ({ ...o, done: !!s.done[o.id] }));
  const doneCount = objectives.filter((o) => o.done).length;

  if (s.phase === "debrief") {
    return (
      <DebriefView
        debrief={s.debrief}
        fallback={objectives}
        // Brief'i atla: doğrudan Rol Yap sekmesine dön
        onBack={() => router.dismissTo("/roleplay")}
        onAgain={() => void RoleplaySessionController.again()}
      />
    );
  }

  const locked = s.busy || s.grace;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-canvas">
      {/* Üst güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil */}
      <View style={{ paddingTop: insets.top }}>
        <PlayTopBar
          title={s.session.title}
          done={doneCount}
          total={objectives.length}
          onClose={() => RoleplaySessionController.confirmExit()}
          onFinish={() => void RoleplaySessionController.finish()}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4 pb-2">
          {objectives.map((o) => (
            <ObjectiveChip key={o.id} label={o.label} done={o.done} />
          ))}
        </ScrollView>
      </View>

      <AvatarStage
        speaking={s.speaking}
        avatarId={s.avatarId}
        tutorName={s.tutorName}
        activity={s.recording ? "listening" : s.busy && !s.speaking ? "thinking" : "idle"}
      />

      <FlatList
        ref={listRef}
        data={s.messages}
        keyExtractor={(m) => m.id}
        className="flex-1"
        contentContainerClassName="gap-2.5 px-4 pb-4 pt-2"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          item.role === "user" ? (
            <UserTurn messageId={item.id} text={item.text} />
          ) : (
            // Karakterin sözünde kelimeye dokununca anlamı rıhtımın üstündeki kartta
            <MessageBubble role="teacher" text={item.text} runs={item.runs} plain onWord={(w, sentence) => void NotebookController.lookup(w, sentence)} />
          )
        }
      />

      <WordCard />
      {s.notice && <NoticeBar text={s.notice} />}

      <InputDock
        locked={locked}
        recording={s.recording}
        placeholder={s.busy ? tr.lesson.thinking(s.tutorName) : tr.roleplay.play.placeholder}
        onSend={(t) => void RoleplaySessionController.say(t)}
        onPressMic={() => void RoleplaySessionController.pressMic()}
        onReleaseMic={() => void RoleplaySessionController.releaseMic()}
      />

      <ReviewSheet />

      {s.phase === "ending" ? (
        <Animated.View entering={FadeIn.duration(200)} className="absolute inset-0 items-center justify-center gap-3 bg-canvas/90">
          <ActivityIndicator color={colors.brand} size="large" />
          <Text className="text-base font-semibold text-foreground">{tr.roleplay.play.finishing}</Text>
        </Animated.View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

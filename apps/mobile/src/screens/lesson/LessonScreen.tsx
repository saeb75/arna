import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MessageBubble } from "../../components/shared/MessageBubble";
import { LessonSessionController } from "../../controllers/LessonSessionController";
import { useLessonSessionStore } from "../../stores/useLessonSessionStore";
import { AvatarStage } from "./AvatarStage";
import { FinishButton } from "./FinishButton";
import { HintCard } from "./HintCard";
import { OptionButtons } from "./OptionButtons";

/**
 * DERS EKRANI — yalnız store'dan okur, yalnız controller çağırır (CLAUDE.md).
 * Akış makinesi LessonSessionController'da; burada tek bir karar bile yok.
 */
export function LessonScreen({ catalogLessonId }: { catalogLessonId: string }) {
  const {
    lesson, loadError, started, phase, beatIndex, awaiting,
    messages, hint, speaking, recording, busy, grace, resume,
  } = useLessonSessionStore();
  const [typed, setTyped] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    void LessonSessionController.open(catalogLessonId);
    return () => LessonSessionController.leave(); // çıkışta sesi sustur
  }, [catalogLessonId]);

  useEffect(() => {
    // Yeni balon yerleştikten sonra dibe in (web'deki rAF dersinin karşılığı)
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="text-center text-sm text-danger">Ders yüklenemedi ({loadError})</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary">← Geri</Text>
        </Pressable>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Ders hazırlanıyor…</Text>
      </View>
    );
  }

  // Başlamadan önce: başlık + tema + başlat (web'deki unlock kapısı karşılığı).
  // Açık oturum varsa iki yol: aynı oturumda devam ya da terk edip baştan.
  if (!started) {
    return (
      <View className="flex-1 justify-center gap-4 bg-background px-6">
        <Text className="text-2xl font-bold text-foreground">{lesson.title}</Text>
        <Text className="text-sm text-muted">{lesson.theme}</Text>
        {resume ? (
          <>
            <Button
              title="Kaldığın yerden devam et"
              disabled={busy}
              onPress={() => LessonSessionController.resume()}
            />
            <Button
              title="Baştan başla"
              variant="outline"
              disabled={busy}
              onPress={() => void LessonSessionController.restart()}
            />
          </>
        ) : (
          <Button
            title="Derse başla"
            disabled={busy}
            onPress={() => void LessonSessionController.start()}
          />
        )}
        <Button title="Geri" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const beat = lesson.lecture.beats[beatIndex];
  const mcqOptions =
    awaiting === "exercise" && beat?.kind === "exercise" && beat.answerSpec.kind === "choice" && beat.options?.length
      ? beat.options
      : null;
  /**
   * GİRDİ KİLİDİ — TEK kaynak.
   *
   * Konuşma sırasında girdi AÇIK: mikrofona basmak ya da göndermek sözü keser
   * (bkz. LessonSessionController.bargeIn). Kapalı kaldığı iki durum da "ortada
   * okunacak/cevaplanacak bir şey yok" demek: sunucu düşünüyor (busy) ya da metin
   * yeni düştü ve kullanıcıya okuması için yarım saniye tanınıyor (grace).
   */
  const inputLocked = busy || grace;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-14">
        <Pressable onPress={() => LessonSessionController.confirmExit()} hitSlop={12}>
          <Text className="text-lg text-muted">✕</Text>
        </Pressable>
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>{lesson.title}</Text>
        <Pressable onPress={() => LessonSessionController.showHint()} hitSlop={12}>
          <Text className="text-lg">💡</Text>
        </Pressable>
      </View>

      <AvatarStage speaking={speaking} />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        className="flex-1"
        contentContainerClassName="gap-2 px-4 pb-3"
        renderItem={({ item }) => (
          <MessageBubble role={item.role} text={item.text} runs={item.runs} points={item.points} />
        )}
      />

      {hint && <HintCard hint={hint} label={lesson.ui.labels.hint} />}
      {mcqOptions && (
        <OptionButtons
          options={mcqOptions}
          disabled={inputLocked}
          onSelect={(opt) => LessonSessionController.submitOption(opt)}
        />
      )}
      {phase === "wrapup" && (
        <View className="px-4 pb-2">
          <FinishButton onFinish={() => void LessonSessionController.finish()} />
        </View>
      )}

      <View className="flex-row items-center gap-2 border-t border-border px-4 pb-8 pt-3">
        <View className="flex-1">
          <Input
            value={typed}
            editable={!inputLocked}
            placeholder={
              inputLocked ? "Emma yazıyor…" : awaiting ? "Cevabını yaz…" : "Yaz ve gönder — Emma susar"
            }
            onChangeText={setTyped}
            onSubmitEditing={() => {
              const t = typed.trim();
              if (!t) return;
              setTyped("");
              void LessonSessionController.handleUserText(t);
            }}
            returnKeyType="send"
          />
        </View>
        <Pressable
          // Kayıt SÜRERKEN asla kilitlenmez: parmak basılıyken `disabled` true
          // olursa RN onPressOut'u düşürebilir ve kayıt sahipsiz kalır (mikrofon
          // açık, cevap hiç gönderilmez). Basılan buton her zaman bırakılabilmeli.
          disabled={inputLocked && !recording}
          onPressIn={() => void LessonSessionController.pressMic()}
          onPressOut={() => void LessonSessionController.releaseMic()}
          className={`size-14 items-center justify-center rounded-full ${
            recording ? "bg-danger" : inputLocked ? "bg-nodeIdle" : "bg-primary"
          }`}
        >
          <Text className="text-xl">🎙</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

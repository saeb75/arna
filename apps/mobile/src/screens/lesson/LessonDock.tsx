import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { hasWordContent } from "@glotmate/contracts";
import Animated, { FadeIn, ZoomIn, ZoomOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowUp, Keyboard, MessageSquareText, Mic } from "lucide-react-native";
import { MicButton } from "../../components/shared/MicButton";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Ders rıhtımı — SESLİ mod varsayılan: ortada büyük bas-konuş, solda klavyeye
 * geçiş, sağda transkript. YAZI modunda metin hapı + gönder. Karar vermez:
 * kilit (`locked = busy || grace`), kayıt bayrağı ve eylemler çağırandan gelir.
 * Mikrofon basılıyken ASLA disabled olmaz (MicButton kök kuralı).
 */
export function LessonDock({
  locked,
  recording,
  placeholder,
  tutorName,
  onSend,
  onPressMic,
  onReleaseMic,
  onTranscript,
}: {
  locked: boolean;
  recording: boolean;
  placeholder: string;
  /** Öğretmenin adı — "… düşünüyor" */
  tutorName: string;
  onSend: (text: string) => void;
  onPressMic: () => void;
  onReleaseMic: () => void;
  onTranscript: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  // Yalnız noktalama (",,") gönderilecek söz değildir — boş gibi davranılır
  const sendable = hasWordContent(typed);
  const send = () => {
    if (!sendable || locked) return;
    setTyped("");
    onSend(typed.trim());
  };
  const caption = recording ? tr.lesson.releaseToSend : locked ? tr.lesson.thinking(tutorName) : tr.lesson.holdToTalk;

  return (
    // Alt güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="px-4 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
      {typing ? (
        <Animated.View entering={FadeIn.duration(180)} className="flex-row items-center gap-3 pb-1">
          <RoundIconButton
            variant="muted"
            icon={<Mic color={colors.foreground} size={20} />}
            label={tr.lesson.voiceInstead}
            onPress={() => setTyping(false)}
          />
          <View className="h-12 flex-1 flex-row items-center rounded-full bg-muted pl-4 pr-1.5">
            <TextInput
              autoFocus
              value={typed}
              editable={!locked}
              onChangeText={setTyped}
              onSubmitEditing={send}
              returnKeyType="send"
              placeholder={placeholder}
              placeholderTextColor={colors["muted-foreground"]}
              selectionColor={colors.brand}
              className="flex-1 text-base text-foreground"
            />
            {sendable ? (
              <Animated.View entering={ZoomIn.duration(180)} exiting={ZoomOut.duration(140)}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr.common.send}
                  onPress={send}
                  disabled={locked}
                  className={`size-9 items-center justify-center rounded-full bg-primary active:opacity-80 ${locked ? "opacity-40" : ""}`}
                >
                  <ArrowUp color={colors["primary-foreground"]} size={20} strokeWidth={2.6} />
                </Pressable>
              </Animated.View>
            ) : null}
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(180)} className="items-center gap-2">
          <View className="w-full flex-row items-center justify-between">
            <RoundIconButton
              variant="muted"
              icon={<Keyboard color={colors.foreground} size={20} />}
              label={tr.lesson.typeInstead}
              onPress={() => setTyping(true)}
            />
            <MicButton size={76} locked={locked} recording={recording} onPressIn={onPressMic} onPressOut={onReleaseMic} />
            <RoundIconButton
              variant="muted"
              icon={<MessageSquareText color={colors.foreground} size={20} />}
              label={tr.lesson.transcript}
              onPress={onTranscript}
            />
          </View>
          <Text className={`text-[13px] font-semibold ${recording ? "text-destructive" : "text-muted-foreground"}`}>{caption}</Text>
        </Animated.View>
      )}
    </View>
  );
}

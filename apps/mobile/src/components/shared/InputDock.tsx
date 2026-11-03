import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { hasWordContent } from "@glotmate/contracts";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowUp } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { MicButton } from "./MicButton";

/**
 * Alt giriş rıhtımı — ders VE rol yapma: yazı hapı + gönder + bas-konuş.
 * Karar vermez: kilit (`locked = busy || grace`), kayıt bayrağı ve eylemler
 * çağırandan (controller) gelir. Gönderilen metin hemen temizlenir.
 */
export function InputDock({
  locked,
  recording,
  placeholder,
  onSend,
  onPressMic,
  onReleaseMic,
}: {
  locked: boolean;
  recording: boolean;
  placeholder: string;
  onSend: (text: string) => void;
  onPressMic: () => void;
  onReleaseMic: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [typed, setTyped] = useState("");
  // Yalnız noktalama (",,") gönderilecek söz değildir — boş gibi davranılır
  const sendable = hasWordContent(typed);
  const send = () => {
    if (!sendable || locked) return;
    setTyped("");
    onSend(typed.trim());
  };
  return (
    // Alt güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="rounded-t-[28px] border-t border-border bg-background px-4 pt-3" style={{ paddingBottom: insets.bottom + 10 }}>
      {recording ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} className="mb-2 items-center">
          <Text className="text-xs font-bold tracking-widest text-destructive">● {tr.lesson.releaseToSend.toUpperCase()}</Text>
        </Animated.View>
      ) : null}
      <View className="flex-row items-center gap-3">
        <View className="h-12 flex-1 flex-row items-center rounded-full bg-muted pl-4 pr-1.5">
          <TextInput
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
        <MicButton locked={locked} recording={recording} onPressIn={onPressMic} onPressOut={onReleaseMic} />
      </View>
    </View>
  );
}

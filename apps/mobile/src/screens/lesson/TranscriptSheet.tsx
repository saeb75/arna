import { useRef } from "react";
import { FlatList, Modal, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { MessageBubble } from "../../components/shared/MessageBubble";
import { RoundIconButton } from "../../components/ui/RoundIconButton";
import { tr } from "../../i18n/tr";
import type { LessonMessage } from "../../stores/useLessonSessionStore";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Dersin tüm konuşması — ekranda yalnız o anki söz (altyazı) durur, geçmiş
 * burada. Native sayfa sheet'i (RN Modal `pageSheet`): aşağı çekince kapanır.
 * Ders arkada sürer; sheet akışa dokunmaz.
 */
export function TranscriptSheet({ visible, messages, onClose }: { visible: boolean; messages: LessonMessage[]; onClose: () => void }) {
  const colors = useThemeColors();
  const listRef = useRef<FlatList<LessonMessage>>(null);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-canvas">
        <View className="flex-row items-center justify-between px-5 pb-2 pt-5">
          <Text className="text-2xl font-extrabold tracking-tight text-foreground">{tr.lesson.transcriptTitle}</Text>
          <RoundIconButton variant="muted" icon={<X color={colors.foreground} size={20} />} label={tr.common.close} onPress={onClose} />
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerClassName="gap-2.5 px-4 pb-10 pt-2"
          // Açılışta (ve sheet açıkken gelen yeni sözde) en yeni söz görünsün
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={<Text className="px-1 pt-6 text-center text-muted-foreground">{tr.lesson.transcriptEmpty}</Text>}
          renderItem={({ item }) => <MessageBubble role={item.role} text={item.text} runs={item.runs} points={item.points} />}
        />
      </View>
    </Modal>
  );
}

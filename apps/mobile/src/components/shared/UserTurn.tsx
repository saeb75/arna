import { View } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { ReviewBadge } from "./ReviewBadge";

/**
 * Öğrencinin sözü + yanında inceleme rozeti — ders ve rol yapma ortak kullanır.
 * Rozet yoksa (inceleme istenmedi) satır yalnız balondur.
 */
export function UserTurn({ messageId, text }: { messageId: string; text: string }) {
  return (
    <View className="flex-row items-center justify-end gap-2">
      <ReviewBadge messageId={messageId} />
      <MessageBubble role="user" text={text} />
    </View>
  );
}

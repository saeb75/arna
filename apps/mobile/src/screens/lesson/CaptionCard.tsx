import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { RunsText } from "../../components/shared/RunsText";
import type { LessonMessage } from "../../stores/useLessonSessionStore";

const rise = FadeInDown.duration(260).easing(Easing.out(Easing.cubic));

/**
 * ALTYAZI — hocanın o anki sözü (görüntülü görüşme hissi): sohbet duvarı yerine
 * tek, büyük, okunaklı kart. Anlatım maddeleri satır satır; İngilizce parçalar
 * marka renginde. Geçmiş Transkript sheet'inde. Kart tam genişlik olduğu için
 * maddelerde `flex-1` güvenli (balondaki sıfır-genişlik çöküşü burada yok).
 */
export function CaptionCard({ message }: { message: LessonMessage }) {
  return (
    <Animated.View key={message.id} entering={rise} className="rounded-3xl border border-border bg-card px-5 py-4">
      {message.points?.length ? (
        <View className="gap-3">
          {message.points.map((p, i) => (
            <View key={i} className="flex-row gap-3">
              <View className="mt-3 size-1.5 rounded-full bg-brand" />
              <RunsText runs={p} size="lg" className="flex-1" />
            </View>
          ))}
        </View>
      ) : message.runs?.length ? (
        <RunsText runs={message.runs} size="lg" />
      ) : (
        <Text className="text-[19px] leading-[27px] text-foreground">{message.text}</Text>
      )}
    </Animated.View>
  );
}

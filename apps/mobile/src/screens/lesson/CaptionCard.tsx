import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { StreamingRunsText } from "../../components/shared/StreamingRunsText";
import type { LessonMessage } from "../../stores/useLessonSessionStore";

const rise = FadeInDown.duration(260).easing(Easing.out(Easing.cubic));

/**
 * HOCA SÖZÜ KARTI — ders akışındaki her hoca sözü. Anlatım maddeleri satır satır;
 * İngilizce parçalar marka renginde. Kart TAM GENİŞLİK (sağa büyümez); yeni söz
 * kelime kelime yumuşak solmayla belirir (`StreamingRunsText`, `animate` yalnız en
 * yeni sözde) — kelimeler baştan yerleşik olduğu için kart yüksekliği zıplamaz.
 */
export function CaptionCard({ message, animate = false }: { message: LessonMessage; animate?: boolean }) {
  return (
    <Animated.View key={message.id} entering={rise} className="rounded-3xl border border-border bg-card px-5 py-4">
      {message.points?.length ? (
        <View className="gap-3">
          {message.points.map((p, i) => (
            <View key={i} className="flex-row gap-3">
              <View className="mt-3 size-1.5 rounded-full bg-brand" />
              <StreamingRunsText runs={p} animate={animate} className="flex-1" />
            </View>
          ))}
        </View>
      ) : message.runs?.length ? (
        <StreamingRunsText runs={message.runs} animate={animate} />
      ) : (
        <Text className="text-[19px] leading-[27px] text-foreground">{message.text}</Text>
      )}
    </Animated.View>
  );
}

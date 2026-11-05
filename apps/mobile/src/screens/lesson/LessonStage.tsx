import { Text, View } from "react-native";
import type { AvatarActivity } from "@glotmate/contracts";
import { AvatarStage } from "../../components/shared/AvatarStage";
import { tr } from "../../i18n/tr";

/**
 * Ders sahnesi — avatar SOLDA, 2:3 dikey kart; yanında ad + durum. Altında dersin
 * tüm konuşması kaydırılabilir akış olarak durur (LessonScreen).
 *
 * 5 Kas 2026, kullanıcı kararı: eski "anlatımda büyük görüntülü görüşme +
 * alıştırmada köşede küçük avatar" düzeni emekli — ekranda yalnız o anki söz
 * durduğu için geçmişi görmek Transkript sheet'ine dokunmayı gerektiriyordu.
 * Alıştırmadaki düzen her yere yayıldı, avatar ondan bir tık büyük.
 */
export function LessonStage({
  speaking,
  avatarId,
  activity,
}: {
  speaking: boolean;
  avatarId: string;
  activity: AvatarActivity;
}) {
  const status = speaking ? tr.lesson.talking : activity === "listening" ? tr.lesson.listening : null;
  return (
    <View className="flex-row items-center gap-4 px-4 pb-3 pt-1">
      <View className="h-[180px] w-[120px] overflow-hidden rounded-3xl border border-border bg-card">
        <AvatarStage fill speaking={speaking} avatarId={avatarId} activity={activity} />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-xl font-bold text-foreground">{tr.lesson.tutorName}</Text>
        <View className="flex-row items-center gap-1.5">
          <View className={`size-2 rounded-full ${status ? "bg-positive" : "bg-muted-foreground/40"}`} />
          <Text className="text-sm text-muted-foreground">{status ?? tr.lesson.waiting}</Text>
        </View>
      </View>
    </View>
  );
}

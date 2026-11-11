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
  tutorName,
  activity,
  compact = false,
}: {
  speaking: boolean;
  avatarId: string;
  /** Öğretmenin adı (GET /v1/avatar) */
  tutorName: string;
  activity: AvatarActivity;
  /** Oyun bloğunda avatar küçülür — alan alıştırma kartına kalır */
  compact?: boolean;
}) {
  const status = speaking ? tr.lesson.talking : activity === "listening" ? tr.lesson.listening : null;
  return (
    <View className="flex-row items-center gap-4 px-4 pb-3 pt-1">
      <View className={`${compact ? "h-[96px] w-[64px] rounded-2xl" : "h-[180px] w-[120px] rounded-3xl"} overflow-hidden border border-border bg-card`}>
        <AvatarStage fill speaking={speaking} avatarId={avatarId} tutorName={tutorName} activity={activity} />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-xl font-bold text-foreground">{tutorName}</Text>
        <View className="flex-row items-center gap-1.5">
          <View className={`size-2 rounded-full ${status ? "bg-positive" : "bg-muted-foreground/40"}`} />
          <Text className="text-sm text-muted-foreground">{status ?? tr.lesson.waiting}</Text>
        </View>
      </View>
    </View>
  );
}

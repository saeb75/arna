import { View } from "react-native";
import type { AvatarActivity } from "@glotmate/contracts";
import { AvatarStage } from "../../components/shared/AvatarStage";

/** Avatar kartının ölçüleri — akış, ilk sözü kartın yanına sığdırmak için okur */
export const STAGE_SIZE = { width: 120, height: 180 };

/**
 * Ders sahnesi — YALNIZ avatar, 2:3 dikey kart. Ad ve durum satırı yok (12 Kas 2026,
 * kullanıcı kararı): avatar köşede durur, yanındaki alan konuşma akışına kalır.
 * Yerleşimi LessonScreen belirler (anlatımda sağ üstte yüzen kart, oyun bloğunda küçük).
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
  /** Öğretmenin adı (GET /v1/avatar) — avatar yüklenirken/göstergede kullanılır */
  tutorName: string;
  activity: AvatarActivity;
  /** Oyun bloğunda avatar küçülür — alan alıştırma kartına kalır */
  compact?: boolean;
}) {
  return (
    <View className={`${compact ? "h-[96px] w-[64px] rounded-2xl" : "h-[180px] w-[120px] rounded-3xl"} overflow-hidden border border-border bg-card`}>
      <AvatarStage fill speaking={speaking} avatarId={avatarId} tutorName={tutorName} activity={activity} />
    </View>
  );
}

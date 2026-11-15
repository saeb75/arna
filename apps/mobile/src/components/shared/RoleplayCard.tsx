import { Pressable, Text, View } from "react-native";
import { CircleCheck, Target } from "lucide-react-native";
import type { RoleplayListItem } from "@glotmate/contracts";
import { RoleplayArt } from "../../components/shared/RoleplayArt";
import { categoryLook } from "../../domain/roleplayCategories";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Senaryo kartı — kategori gradyanı üstünde İngilizce başlık (sahne İngilizce
 * geçer), persona adı, hedef sayısı; oynandıysa son skor rozeti.
 * `large`: "Seviyene uygun" karuseli; aksi hâlde raf karosu.
 */
export function RoleplayCard({ item, large = false, onPress }: { item: RoleplayListItem; large?: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  const look = categoryLook(item.category);
  const last = item.lastAttempt;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${look.label}`}
      onPress={() => {
        HapticsService.tap();
        onPress();
      }}
      className={`overflow-hidden rounded-3xl active:opacity-90 ${large ? "h-[188px] w-[288px]" : "h-[150px] w-[200px]"}`}
      style={{ shadowColor: colors.scrim, shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}
    >
      <RoleplayArt category={item.category} iconSize={large ? 150 : 110} />
      <View className="flex-1 justify-between p-4">
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-scrim/25 px-2.5 py-1">
            <Text className="text-[11px] font-bold text-on-image">{look.label}</Text>
          </View>
          {last ? (
            <View className="flex-row items-center gap-1 rounded-full bg-on-image px-2 py-1">
              <CircleCheck color={colors.positive} size={12} strokeWidth={2.6} />
              <Text className="text-[11px] font-extrabold text-positive">{tr.roleplay.lastScore(last.done, last.total)}</Text>
            </View>
          ) : null}
        </View>
        <View className="gap-1">
          <Text numberOfLines={2} className={`font-extrabold leading-tight text-on-image ${large ? "text-2xl" : "text-lg"}`}>
            {item.title}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Target color={colors["on-image-muted"]} size={13} />
            <Text numberOfLines={1} className="text-xs font-semibold text-on-image-muted">
              {item.personaName} · {tr.roleplay.goals(item.objectiveCount)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

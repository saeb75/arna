import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { AudioLines, Check, Volume2 } from "lucide-react-native";
import type { PublicTutor } from "@glotmate/contracts";
import { tutorPortrait } from "../../domain/tutors";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Öğretmen kartı — portre (paketlenmiş 2.5D görsel), ad ve ses ikonu. Dokunmak
 * seçer ve sesini çaldırır (ebeveynin işi); çalarken ikon dalgaya döner.
 * Onboarding adımı ve ayarlar sheet'i paylaşır.
 */
export function TutorCard({
  tutor,
  selected,
  sampling,
  onPress,
}: {
  tutor: PublicTutor;
  selected: boolean;
  /** Bu öğretmenin ses örneği isteniyor/çalıyor */
  sampling: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const portrait = tutorPortrait(tutor.avatarId);
  const Sound = sampling ? AudioLines : Volume2;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={tutor.name}
      accessibilityHint={tr.onboarding.teacher.listen}
      onPress={() => {
        HapticsService.selection();
        onPress();
      }}
      className={`overflow-hidden rounded-3xl border-2 active:opacity-80 ${selected ? "border-brand bg-brand/10" : "border-border bg-card"}`}
    >
      <View className="aspect-[4/5] w-full bg-muted">
        {/* expo-image NativeWind sınıfı almaz (cssInterop yok) — ölçü style ile, SpriteAvatar'daki gibi */}
        {portrait !== null ? (
          <Image source={portrait} contentFit="cover" contentPosition="top" transition={0} accessibilityIgnoresInvertColors style={{ width: "100%", height: "100%" }} />
        ) : null}
        {selected ? (
          <View className="absolute right-2.5 top-2.5 size-7 items-center justify-center rounded-full bg-brand">
            <Check color={colors["on-brand"]} size={16} strokeWidth={3.2} />
          </View>
        ) : null}
      </View>
      <View className="flex-row items-center justify-between gap-2 px-3.5 py-3">
        <Text numberOfLines={1} className="flex-1 text-[17px] font-bold text-foreground">
          {tutor.name}
        </Text>
        <View className={`size-8 items-center justify-center rounded-full ${sampling ? "bg-brand" : "bg-muted"}`}>
          <Sound color={sampling ? colors["on-brand"] : colors.brand} size={16} />
        </View>
      </View>
    </Pressable>
  );
}

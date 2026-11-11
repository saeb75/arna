import { View } from "react-native";
import Animated from "react-native-reanimated";
import type { PublicTutor } from "@glotmate/contracts";
import { enter } from "../../theme/motion";
import { TutorCard } from "./TutorCard";

/**
 * Öğretmen seçimi — iki sütun portre kartı, kademeli giriş. Seçim ve ses örneği
 * ebeveynin (`onPick`): onboarding taslağa, ayarlar yerel taslağa yazar.
 */
export function TutorGrid({
  tutors,
  selectedId,
  samplingId,
  onPick,
  delay = 2,
}: {
  tutors: PublicTutor[];
  selectedId: string | null;
  samplingId: string | null;
  onPick: (id: string) => void;
  /** Giriş kademesinin başlangıcı (üstteki başlıkların ardından) */
  delay?: number;
}) {
  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap justify-between gap-y-3">
      {tutors.map((t, i) => (
        <Animated.View key={t.id} entering={enter(delay + Math.min(i, 6))} className="w-[48.5%]">
          <TutorCard tutor={t} selected={t.id === selectedId} sampling={t.id === samplingId} onPress={() => onPick(t.id)} />
        </Animated.View>
      ))}
    </View>
  );
}

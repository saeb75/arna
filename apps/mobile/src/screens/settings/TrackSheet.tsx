import { ScrollView } from "react-native";
import { TRACKS, type Track } from "@glotmate/contracts";
import { OptionCard } from "../../components/ui/OptionCard";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { MeController } from "../../controllers/MeController";
import { TRACK_ICON } from "../../domain/tracks";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { closeSheetSoon } from "./closeSheet";

/** Konuşma bağlamı — yalnız rol yapma sahnelerinin dekorunu değiştirir. */
export function TrackSheet() {
  const colors = useThemeColors();
  const track = useMeStore((s) => s.me?.profile?.track);
  const pick = async (t: Track) => {
    if (t === track) return closeSheetSoon();
    if (await MeController.updateProfile({ track: t })) closeSheetSoon();
  };
  return (
    // Kaydırıcı sheet'in TEK ve KÖK çocuğu: native formSheet onu kaydırır (sarmalayan
    // flex-1 View içinde içerik sıfır yüksekliğe düşüyordu — simülatörde ölçüldü)
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-2.5 px-5 pb-10 pt-8">
        <SheetHeader title={tr.settings.trackTitle} body={tr.settings.trackBody} />
        {TRACKS.map((key) => {
          const Icon = TRACK_ICON[key];
          return (
            <OptionCard
              key={key}
              title={tr.tracks[key].title}
              subtitle={tr.tracks[key].subtitle}
              icon={<Icon color={colors.brand} size={22} />}
              selected={track === key}
              onPress={() => void pick(key)}
            />
          );
        })}
    </ScrollView>
  );
}

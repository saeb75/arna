import { ScrollView, Text } from "react-native";
import { CEFR_LEVELS, type CefrLevel } from "@glotmate/contracts";
import { OptionCard } from "../../components/ui/OptionCard";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { MeController } from "../../controllers/MeController";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { closeSheetSoon } from "./closeSheet";

/** Seviye — ilerleme kaybolmaz (katalog kimliğine bağlı); yol yeni seviyeden açılır. */
export function LevelSheet() {
  const level = useMeStore((s) => s.me?.profile?.cefrLevel);
  const pick = async (cefrLevel: CefrLevel) => {
    if (cefrLevel === level) return closeSheetSoon();
    if (await MeController.updateProfile({ cefrLevel })) closeSheetSoon();
  };
  return (
    // Kaydırıcı sheet'in TEK ve KÖK çocuğu: native formSheet onu kaydırır (sarmalayan
    // flex-1 View içinde içerik sıfır yüksekliğe düşüyordu — simülatörde ölçüldü)
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-2.5 px-5 pb-10 pt-8">
        <SheetHeader title={tr.settings.levelTitle} body={tr.settings.levelBody} />
        {CEFR_LEVELS.map((key) => (
          <OptionCard
            key={key}
            title={`${key} · ${tr.levels[key].name}`}
            subtitle={tr.levels[key].line}
            selected={level === key}
            onPress={() => void pick(key)}
            icon={<Text className="text-sm font-extrabold text-brand">{key}</Text>}
          />
        ))}
    </ScrollView>
  );
}

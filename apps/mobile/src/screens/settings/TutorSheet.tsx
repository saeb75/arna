import { View } from "react-native";
import { Globe, Languages } from "lucide-react-native";
import type { TutorLanguage } from "@glotmate/contracts";
import { OptionCard } from "../../components/ui/OptionCard";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { MeController } from "../../controllers/MeController";
import { DEFAULT_NATIVE_LANGUAGE, languageName } from "../../domain/language";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { closeSheetSoon } from "./closeSheet";

/** Açıklama dili — bir sonraki dersten itibaren geçerli. Rol yapma her zaman İngilizce. */
export function TutorSheet() {
  const colors = useThemeColors();
  const profile = useMeStore((s) => s.me?.profile);
  const pick = async (tutorLanguage: TutorLanguage) => {
    if (tutorLanguage === profile?.tutorLanguage) return closeSheetSoon();
    if (await MeController.updateProfile({ tutorLanguage })) closeSheetSoon();
  };
  return (
    <View className="gap-3 bg-canvas px-5 pb-10 pt-8">
      <SheetHeader title={tr.settings.tutorTitle} body={tr.onboarding.tutor.body} />
      <OptionCard
        title={tr.tutorLanguage.native(languageName(profile?.nativeLanguage || DEFAULT_NATIVE_LANGUAGE))}
        subtitle={tr.tutorLanguage.nativeBody}
        icon={<Languages color={colors.brand} size={22} />}
        selected={profile?.tutorLanguage === "native"}
        onPress={() => void pick("native")}
      />
      <OptionCard
        title={tr.tutorLanguage.english}
        subtitle={tr.tutorLanguage.englishBody}
        icon={<Globe color={colors.brand} size={22} />}
        selected={profile?.tutorLanguage === "english"}
        onPress={() => void pick("english")}
      />
    </View>
  );
}

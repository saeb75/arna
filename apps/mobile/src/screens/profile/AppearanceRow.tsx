import { Text, View } from "react-native";
import { SunMoon } from "lucide-react-native";
import { PillSegmented } from "../../components/ui/PillSegmented";
import { SettingsController } from "../../controllers/SettingsController";
import { tr } from "../../i18n/tr";
import { useSettingsStore } from "../../stores/useSettingsStore";
import type { SchemeSetting } from "../../theme/scheme";
import { useThemeColors } from "../../theme/useThemeColors";

const SCHEMES: SchemeSetting[] = ["system", "light", "dark"];

/** Açık/koyu doğrudan satırda (Sistem telefonu izler) — bütün uygulama aynı karede yeniden boyanır. */
export function AppearanceRow() {
  const colors = useThemeColors();
  const scheme = useSettingsStore((s) => s.scheme);
  return (
    <View className="gap-3 px-4 py-3">
      <View className="flex-row items-center gap-3">
        <View className="size-9 items-center justify-center rounded-xl bg-brand/10">
          <SunMoon color={colors.brand} size={18} strokeWidth={2.2} />
        </View>
        <Text className="flex-1 text-base font-medium text-foreground">{tr.profile.rows.appearance}</Text>
      </View>
      <PillSegmented onCard options={SCHEMES.map((value) => ({ value, label: tr.profile.appearance[value] }))} value={scheme} onChange={(v) => SettingsController.setScheme(v)} />
    </View>
  );
}

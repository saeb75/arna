import { useState } from "react";
import { View } from "react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { TextField } from "../../components/ui/TextField";
import { MeController } from "../../controllers/MeController";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { closeSheetSoon } from "./closeSheet";

/** Ad — öğretmen selamlamada kullanır. (Taslak metin sunumsal yerel durum.) */
export function NameSheet() {
  const current = useMeStore((s) => s.me?.profile?.displayName ?? "");
  const saving = useMeStore((s) => s.saving);
  const [name, setName] = useState(current);
  const save = async () => {
    const displayName = name.trim();
    if (!displayName || displayName === current) return closeSheetSoon();
    if (await MeController.updateProfile({ displayName })) closeSheetSoon();
  };
  return (
    <View className="gap-4 bg-canvas px-5 pb-10 pt-8">
      <SheetHeader title={tr.settings.nameTitle} />
      <TextField large autoFocus value={name} maxLength={60} autoCapitalize="words" returnKeyType="done" onChangeText={setName} onSubmitEditing={() => void save()} />
      <CtaButton label={tr.common.save} busy={saving} disabled={!name.trim()} onPress={() => void save()} />
    </View>
  );
}

import { router } from "expo-router";
import { AlarmClock, Bell } from "lucide-react-native";
import { SettingsGroup } from "../../components/shared/SettingsGroup";
import { SettingsRow } from "../../components/shared/SettingsRow";
import { SettingsSwitchRow } from "../../components/shared/SettingsSwitchRow";
import { NotificationController } from "../../controllers/NotificationController";
import { tr } from "../../i18n/tr";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { AppearanceRow } from "./AppearanceRow";

/** Uygulama: görünüm + günlük hatırlatma (aç/kapa, saat). */
export function AppSettings() {
  const reminderOn = useSettingsStore((s) => s.reminderOn);
  const reminderTime = useSettingsStore((s) => s.reminderTime);
  return (
    <SettingsGroup title={tr.profile.groups.app}>
      <AppearanceRow />
      <SettingsSwitchRow
        icon={Bell}
        label={tr.profile.rows.reminder}
        description={reminderOn ? tr.profile.rows.reminderBody(reminderTime) : tr.profile.rows.reminderOff}
        value={reminderOn}
        onChange={(on) => void NotificationController.toggle(on)}
      />
      {reminderOn ? (
        <SettingsRow icon={AlarmClock} label={tr.profile.rows.reminderTime} value={reminderTime} onPress={() => router.push("/settings/reminder")} />
      ) : null}
    </SettingsGroup>
  );
}

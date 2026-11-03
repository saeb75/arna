import { View } from "react-native";
import { AlarmClock, Moon, Sun, Sunrise } from "lucide-react-native";
import { OptionCard } from "../../components/ui/OptionCard";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { NotificationController } from "../../controllers/NotificationController";
import { tr } from "../../i18n/tr";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { closeSheetSoon } from "./closeSheet";

const TIMES = [
  { time: "08:00", Icon: Sunrise },
  { time: "13:00", Icon: Sun },
  { time: "20:00", Icon: Moon },
  { time: "22:00", Icon: AlarmClock },
];

/** Hatırlatma saati — yerel bildirim yeniden zamanlanır. */
export function ReminderSheet() {
  const colors = useThemeColors();
  const current = useSettingsStore((s) => s.reminderTime);
  return (
    <View className="gap-3 bg-canvas px-5 pb-10 pt-8">
      <SheetHeader title={tr.settings.reminderTitle} />
      {TIMES.map(({ time, Icon }) => (
        <OptionCard
          key={time}
          title={time}
          subtitle={tr.onboarding.goal.reminders[time]}
          icon={<Icon color={colors.brand} size={22} />}
          selected={current === time}
          onPress={async () => {
            await NotificationController.setTime(time);
            closeSheetSoon();
          }}
        />
      ))}
    </View>
  );
}

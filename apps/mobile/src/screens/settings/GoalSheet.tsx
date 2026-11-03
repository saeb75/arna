import { View } from "react-native";
import { Coffee, Flame, Footprints } from "lucide-react-native";
import { OptionCard } from "../../components/ui/OptionCard";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { MeController } from "../../controllers/MeController";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { closeSheetSoon } from "./closeSheet";

const GOALS = [
  { min: 5 as const, Icon: Coffee },
  { min: 10 as const, Icon: Footprints },
  { min: 15 as const, Icon: Flame },
];

/** Günlük hedef — bugün kartındaki halka buna göre dolar. */
export function GoalSheet() {
  const colors = useThemeColors();
  const goal = useMeStore((s) => s.me?.profile?.dailyGoalMinutes);
  const pick = async (dailyGoalMinutes: 5 | 10 | 15) => {
    if (dailyGoalMinutes === goal) return closeSheetSoon();
    if (await MeController.updateProfile({ dailyGoalMinutes })) closeSheetSoon();
  };
  return (
    <View className="gap-3 bg-canvas px-5 pb-10 pt-8">
      <SheetHeader title={tr.settings.goalTitle} />
      {GOALS.map(({ min, Icon }) => (
        <OptionCard
          key={min}
          title={tr.onboarding.goal.options[min].title}
          subtitle={tr.onboarding.goal.options[min].body}
          icon={<Icon color={colors.brand} size={22} />}
          selected={goal === min}
          onPress={() => void pick(min)}
        />
      ))}
    </View>
  );
}

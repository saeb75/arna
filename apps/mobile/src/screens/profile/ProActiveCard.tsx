import { Pressable, Text, View } from "react-native";
import { ArrowUpRight, Crown } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { ProController } from "../../controllers/ProController";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { useThemeColors } from "../../theme/useThemeColors";

/** Pro'da: taç altında teşekkür ve mağazanın abonelik sayfası (admin tanımasında gizli). */
export function ProActiveCard() {
  const colors = useThemeColors();
  const source = useMeStore((s) => s.me?.entitlement.source ?? null);
  return (
    <View className="gap-4 rounded-3xl border border-brand/40 bg-brand/5 p-4">
      <View className="flex-row items-center gap-3.5">
        <View className="size-12 items-center justify-center overflow-hidden rounded-2xl">
          <GradientFill />
          <Crown color={colors["on-brand"]} size={22} strokeWidth={2.4} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-bold text-foreground">{source === "admin" ? tr.pro.activeAdmin : tr.pro.active}</Text>
          <Text className="text-sm leading-snug text-muted-foreground">{tr.pro.activeBody}</Text>
        </View>
      </View>
      {source !== "admin" ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => void ProController.manageSubscriptions()}
          className="h-11 flex-row items-center justify-center gap-1.5 rounded-2xl border border-border bg-card active:opacity-80"
        >
          <Text className="text-[15px] font-semibold text-foreground">{tr.pro.manage}</Text>
          <ArrowUpRight color={colors.foreground} size={16} />
        </Pressable>
      ) : null}
    </View>
  );
}

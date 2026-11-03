import { Pressable, Switch, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useScheme } from "../../theme/useScheme";
import { useThemeColors } from "../../theme/useThemeColors";

/** Aç/kapa satırı — bütün satır tıklanır, VoiceOver tek anahtar okur. */
export function SettingsSwitchRow({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  value: boolean;
  onChange: (on: boolean) => void;
}) {
  const colors = useThemeColors();
  const scheme = useScheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      className="min-h-[64px] flex-row items-center gap-3 px-4 py-3 active:bg-muted"
    >
      <View className="size-9 items-center justify-center rounded-xl bg-brand/10">
        <Icon color={colors.brand} size={18} strokeWidth={2.2} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-medium text-foreground">{label}</Text>
        {description ? <Text className="text-sm leading-snug text-muted-foreground">{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        trackColor={{ false: scheme === "dark" ? colors.ring : colors.border, true: colors["brand-strong"] }}
        ios_backgroundColor={scheme === "dark" ? colors.ring : colors.border}
        thumbColor={colors["on-brand"]}
      />
    </Pressable>
  );
}

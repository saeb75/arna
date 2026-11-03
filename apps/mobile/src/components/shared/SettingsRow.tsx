import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ArrowUpRight, ChevronRight, type LucideIcon } from "lucide-react-native";
import { HapticsService } from "../../services/HapticsService";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Ayar satırı: tonlu karoda ikon, etiket, güncel değer ve sağda dokunuşun ne
 * yapacağı — chevron (sheet), ok (uygulama dışı) ya da hiçbiri (eylem).
 */
export function SettingsRow({
  icon: Icon,
  label,
  value,
  display,
  onPress,
  accessory = "chevron",
  destructive = false,
  busy = false,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  /** `value` yerine çizilen öğe (seviye hapı) */
  display?: ReactNode;
  onPress: () => void;
  accessory?: "chevron" | "external" | "none";
  destructive?: boolean;
  busy?: boolean;
}) {
  const colors = useThemeColors();
  const tint = destructive ? colors.destructive : colors.brand;
  const muted = colors["muted-foreground"];
  return (
    <Pressable
      accessibilityRole={accessory === "external" ? "link" : "button"}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={() => {
        HapticsService.tap();
        onPress();
      }}
      className="min-h-[58px] flex-row items-center gap-3 px-4 py-2.5 active:bg-muted"
    >
      <View className={`size-9 items-center justify-center rounded-xl ${destructive ? "bg-destructive/10" : "bg-brand/10"}`}>
        <Icon color={tint} size={18} strokeWidth={2.2} />
      </View>
      <Text numberOfLines={1} className={`flex-1 text-base font-medium ${destructive ? "text-destructive" : "text-foreground"}`}>
        {label}
      </Text>
      {display ??
        (value ? (
          <Text numberOfLines={1} className="max-w-[45%] text-[15px] text-muted-foreground">
            {value}
          </Text>
        ) : null)}
      {busy ? (
        <ActivityIndicator color={muted} />
      ) : accessory === "chevron" ? (
        <ChevronRight color={muted} size={18} />
      ) : accessory === "external" ? (
        <ArrowUpRight color={muted} size={18} />
      ) : null}
    </Pressable>
  );
}

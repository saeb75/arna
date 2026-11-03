import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { useThemeColors } from "../../theme/useThemeColors";

const VARIANT = {
  primary: "bg-primary",
  outline: "border border-border bg-card",
  ghost: "",
  destructive: "bg-destructive/10",
} as const;
const LABEL = {
  primary: "text-primary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive",
} as const;
const SIZE = { sm: "h-9 rounded-lg px-3", md: "h-12 rounded-xl px-4", lg: "h-14 rounded-2xl px-5" } as const;

/** İkincil eylemler (ana eylem CtaButton'dır). */
export function Button({
  label,
  onPress,
  variant = "outline",
  size = "md",
  icon,
  busy = false,
  disabled = false,
  className = "",
}: {
  label: string;
  onPress: () => void;
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  icon?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      onPress={onPress}
      disabled={busy || disabled}
      className={`flex-row items-center justify-center gap-2 active:opacity-80 ${SIZE[size]} ${VARIANT[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {busy ? (
        <ActivityIndicator color={variant === "primary" ? colors["primary-foreground"] : colors.foreground} />
      ) : (
        <>
          {icon}
          <Text className={`${size === "sm" ? "text-sm" : "text-base"} font-semibold ${LABEL[variant]}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

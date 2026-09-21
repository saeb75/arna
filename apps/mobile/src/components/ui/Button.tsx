import { ActivityIndicator, Pressable, Text } from "react-native";
import colors from "../../../colors";

/**
 * Tasarım sistemi butonu — tek bileşen, NativeWind.
 * `variant` büyüdükçe buraya eklenir; ekranlar kendi butonunu YAZMAZ.
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline";
}

export function Button({ title, onPress, disabled, loading, variant = "primary" }: ButtonProps) {
  const base = "h-12 flex-row items-center justify-center rounded-xl px-4";
  const style =
    variant === "primary"
      ? "bg-primary active:opacity-80"
      : "border border-border bg-card active:bg-surface";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${style} ${disabled || loading ? "opacity-40" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onPrimary : colors.primary} />
      ) : (
        <Text
          className={
            variant === "primary" ? "text-base font-semibold text-onPrimary" : "text-base font-medium text-foreground"
          }
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

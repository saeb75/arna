import { ActivityIndicator, Pressable, Text } from "react-native";

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
      : "border border-muted/40 active:bg-card";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${style} ${disabled || loading ? "opacity-40" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={variant === "primary" ? "text-base font-semibold text-white" : "text-base font-medium text-white"}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

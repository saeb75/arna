import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useThemeColors } from "../../theme/useThemeColors";

/** Tek satır giriş — formlar ve onboarding. `error` çerçeveyi kırmızıya çevirir. */
export const TextField = forwardRef<TextInput, TextInputProps & { error?: boolean; large?: boolean }>(
  function TextField({ error = false, large = false, className = "", ...props }, ref) {
    const colors = useThemeColors();
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={colors["muted-foreground"]}
        selectionColor={colors.brand}
        className={`rounded-2xl border-2 bg-card px-4 text-foreground ${large ? "h-16 text-xl font-semibold" : "h-14 text-base"} ${error ? "border-destructive" : "border-border focus:border-brand"} ${className}`}
        {...props}
      />
    );
  },
);

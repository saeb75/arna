import { TextInput, type TextInputProps } from "react-native";
import colors from "../../../colors";

/** Tasarım sistemi girişi — RN TextInput'un GlotMate görünümlü sarmalayıcısı. */
export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      className="h-12 rounded-xl border border-border bg-card px-4 text-base text-foreground"
      {...props}
    />
  );
}

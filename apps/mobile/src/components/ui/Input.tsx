import { TextInput, type TextInputProps } from "react-native";

/** Tasarım sistemi girişi — RN TextInput'un Arna görünümlü sarmalayıcısı. */
export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#6b7280"
      className="h-12 rounded-xl border border-muted/30 bg-card px-4 text-base text-white"
      {...props}
    />
  );
}

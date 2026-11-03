import { useState } from "react";
import { Text, View } from "react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { TextField } from "../../components/ui/TextField";
import { AuthController } from "../../controllers/AuthController";
import { tr } from "../../i18n/tr";
import { useAuthStore } from "../../stores/useAuthStore";

/** E-posta + şifre — giriş ya da bağlama; hata kodu sözlükten okunur. (Alan değerleri sunumsal yerel durum.) */
export function EmailForm({ cta, onSubmit }: { cta: string; onSubmit: (email: string, password: string) => void }) {
  const busy = useAuthStore((s) => s.busy);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const valid = /\S+@\S+\.\S+/.test(email.trim()) && password.length >= 8;
  return (
    <View className="gap-3">
      <TextField
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (error) AuthController.clearError();
        }}
        placeholder={tr.auth.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={error === "invalid_email" || error === "email_exists"}
      />
      <TextField
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (error) AuthController.clearError();
        }}
        placeholder={`${tr.auth.password} · ${tr.auth.passwordHint}`}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        error={error === "weak_password" || error === "invalid_credentials"}
        onSubmitEditing={() => valid && onSubmit(email, password)}
      />
      {error ? <Text className="px-1 text-sm font-medium text-destructive">{tr.auth.errors[error] ?? tr.auth.errors.generic}</Text> : null}
      <CtaButton label={cta} busy={busy} disabled={!valid} onPress={() => onSubmit(email, password)} />
    </View>
  );
}

import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthController } from "../../controllers/AuthController";
import { useAuthStore } from "../../stores/useAuthStore";

/**
 * Login — CLAUDE.md deseni: store'dan okur, controller çağırır.
 * Yönlendirme BURADA DEĞİL: oturum düşünce/gelince app/_layout karar verir.
 */
export function LoginScreen() {
  const { error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    await AuthController.signIn(email.trim(), password);
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 justify-center bg-background px-6"
    >
      <View className="gap-4">
        <Text className="text-center text-3xl font-bold text-white">Arna</Text>
        <Text className="mb-2 text-center text-sm text-muted">
          İngilizce öğretmenin seni bekliyor
        </Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="E-posta"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Şifre"
          secureTextEntry
          autoComplete="password"
        />
        {error && <Text className="text-center text-sm text-red-400">{error}</Text>}
        <Button title="Giriş yap" onPress={() => void submit()} loading={busy} disabled={!email || !password} />
      </View>
    </KeyboardAvoidingView>
  );
}

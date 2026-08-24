import { Redirect } from "expo-router";
import { LoginScreen } from "../screens/login/LoginScreen";
import { useAuthStore } from "../stores/useAuthStore";

export default function LoginRoute() {
  const session = useAuthStore((s) => s.session);
  if (session) return <Redirect href="/lessons" />;
  return <LoginScreen />;
}

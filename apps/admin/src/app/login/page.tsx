"use client";

import { Redirect } from "@/components/shared/Redirect";
import { LoginScreen } from "@/screens/login/LoginScreen";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginRoute() {
  const session = useAuthStore((s) => s.session);
  if (session) return <Redirect href="/lessons" />;
  return <LoginScreen />;
}

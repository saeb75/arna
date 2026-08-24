import { Redirect } from "expo-router";
import { LessonsScreen } from "../screens/lessons/LessonsScreen";
import { useAuthStore } from "../stores/useAuthStore";

export default function LessonsRoute() {
  const session = useAuthStore((s) => s.session);
  if (!session) return <Redirect href="/login" />;
  return <LessonsScreen />;
}

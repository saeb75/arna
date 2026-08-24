import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/useAuthStore";

/** Auth kapısı: oturum varsa dersler, yoksa login. */
export default function Index() {
  const session = useAuthStore((s) => s.session);
  return <Redirect href={session ? "/lessons" : "/login"} />;
}

import { Redirect } from "expo-router";
import { useMeStore } from "../stores/useMeStore";

/** Kapı: profil varsa dersler, yoksa onboarding. (Kök, açılış bitmeden bunu çizmez.) */
export default function Index() {
  const hasProfile = useMeStore((s) => !!s.me?.profile);
  return <Redirect href={hasProfile ? "/lessons" : "/onboarding"} />;
}

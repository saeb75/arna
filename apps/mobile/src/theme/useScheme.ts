import { useColorScheme } from "react-native";
import { useSettingsStore } from "../stores/useSettingsStore";
import { resolveScheme, type Scheme } from "./scheme";

/** Uygulamanın ŞU AN çizdiği tema (kullanıcının seçimi, yoksa telefonunki). */
export function useScheme(): Scheme {
  const setting = useSettingsStore((s) => s.scheme);
  return resolveScheme(setting, useColorScheme());
}

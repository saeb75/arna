import { Stack } from "expo-router";
import { useThemeColors } from "../../theme/useThemeColors";

/** Native formSheet — üst grabber, 28 köşe; içerik yüksekliğine oturur ya da verilen kademelere */
const sheet = (detents: "fitToContents" | number[] = "fitToContents") =>
  ({
    presentation: "formSheet",
    sheetAllowedDetents: detents,
    sheetGrabberVisible: true,
    sheetCornerRadius: 28,
  }) as const;

/**
 * Kök yığın — her ekran kendi üst barını çizer (header yok). Tam ekran akışlar
 * (ders, test, rol yapma) sekmelerin DIŞINDA; paywall tam ekran modal;
 * ayar ve hesap işleri native sheet.
 */
export function RootStack() {
  const colors = useThemeColors();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="onboarding" options={{ animation: "fade", gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      <Stack.Screen name="paywall" options={{ presentation: "fullScreenModal", gestureEnabled: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="lesson/[id]" options={{ gestureEnabled: false }} />
      <Stack.Screen name="checkpoint/[level]/[unit]" options={{ gestureEnabled: false }} />
      <Stack.Screen name="roleplay/[slug]/index" />
      <Stack.Screen name="roleplay/[slug]/play" options={{ gestureEnabled: false, animation: "fade" }} />
      <Stack.Screen name="auth/login" options={{ ...sheet([0.75, 0.95]), contentStyle: { backgroundColor: colors.canvas } }} />
      <Stack.Screen name="auth/save-progress" options={{ ...sheet([0.8, 0.95]), contentStyle: { backgroundColor: colors.canvas } }} />
      <Stack.Screen name="settings/level" options={{ ...sheet([0.85]), contentStyle: { backgroundColor: colors.canvas } }} />
      <Stack.Screen name="settings/track" options={{ ...sheet([0.75]), contentStyle: { backgroundColor: colors.canvas } }} />
      <Stack.Screen name="settings/tutor" options={{ ...sheet(), contentStyle: { backgroundColor: colors.canvas } }} />
      <Stack.Screen name="settings/goal" options={{ ...sheet(), contentStyle: { backgroundColor: colors.canvas } }} />
      <Stack.Screen name="settings/name" options={{ ...sheet(), contentStyle: { backgroundColor: colors.canvas } }} />
      <Stack.Screen name="settings/reminder" options={{ ...sheet(), contentStyle: { backgroundColor: colors.canvas } }} />
    </Stack>
  );
}

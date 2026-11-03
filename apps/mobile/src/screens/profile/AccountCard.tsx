import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { CloudCheck, ShieldCheck, UserRound } from "lucide-react-native";
import { GradientFill } from "../../components/ui/GradientFill";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { useAuthStore } from "../../stores/useAuthStore";
import { useMeStore } from "../../stores/useMeStore";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Kim öğreniyor: misafire ilerlemesini kaydetmesi önerilir (AYNI kullanıcı
 * kalıcı olur); kalıcı hesapta baş harf, ad, e-posta ve "kaydediliyor".
 */
export function AccountCard() {
  const colors = useThemeColors();
  const anonymous = useAuthStore((s) => s.isAnonymous);
  const email = useMeStore((s) => s.me?.email ?? null);
  const name = useMeStore((s) => s.me?.profile?.displayName ?? "");

  if (anonymous) {
    return (
      <View className="gap-4 rounded-3xl border border-border bg-card p-4">
        <View className="flex-row items-center gap-4">
          <View className="size-14 items-center justify-center rounded-full bg-muted">
            <UserRound color={colors["muted-foreground"]} size={26} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-lg font-bold leading-tight text-foreground">{tr.profile.guestTitle}</Text>
            <Text className="text-sm leading-snug text-muted-foreground">{tr.profile.guestBody}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            HapticsService.tap();
            router.push("/auth/save-progress");
          }}
          className="h-12 flex-row items-center justify-center gap-2 overflow-hidden rounded-2xl active:opacity-90"
        >
          <GradientFill />
          <ShieldCheck color={colors["on-brand"]} size={18} strokeWidth={2.4} />
          <Text className="text-base font-bold text-on-brand">{tr.profile.saveProgress}</Text>
        </Pressable>
      </View>
    );
  }

  const initial = (name || email || "").charAt(0).toLocaleUpperCase("tr");
  return (
    <View className="flex-row items-center gap-4 rounded-3xl border border-border bg-card p-4">
      <View className="size-14 items-center justify-center overflow-hidden rounded-full">
        <GradientFill />
        {initial ? <Text className="text-2xl font-extrabold text-on-brand">{initial}</Text> : <UserRound color={colors["on-brand"]} size={26} />}
      </View>
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-lg font-bold text-foreground">
          {name}
        </Text>
        {email ? (
          <Text numberOfLines={1} className="text-sm text-muted-foreground">
            {email}
          </Text>
        ) : null}
        <View className="mt-1 flex-row items-center gap-1 self-start rounded-full bg-positive/10 px-2 py-0.5">
          <CloudCheck color={colors.positive} size={13} strokeWidth={2.4} />
          <Text className="text-xs font-semibold text-positive">{tr.profile.synced}</Text>
        </View>
      </View>
    </View>
  );
}

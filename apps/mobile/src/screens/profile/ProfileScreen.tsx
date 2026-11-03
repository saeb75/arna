import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { MeController } from "../../controllers/MeController";
import { PaywallController } from "../../controllers/PaywallController";
import { ProController } from "../../controllers/ProController";
import { usePro } from "../../hooks/usePro";
import { tr } from "../../i18n/tr";
import { useTabBarSpace } from "../../theme/layout";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";
import { AccountCard } from "./AccountCard";
import { AccountSettings } from "./AccountSettings";
import { AppSettings } from "./AppSettings";
import { LearningSettings } from "./LearningSettings";
import { ProActiveCard } from "./ProActiveCard";
import { ProBanner } from "./ProBanner";
import { ProfileFooter } from "./ProfileFooter";
import { StatsGrid } from "./StatsGrid";
import { SubscriptionSettings } from "./SubscriptionSettings";
import { SupportSettings } from "./SupportSettings";

/**
 * Profil: kim öğreniyor (misafirse "ilerlemeni kaydet"), Pro (giriş ya da
 * aktif), ilerleme rakamları, sonra ayarlar — öğrenme, uygulama, abonelik,
 * destek, hesap — ve sürüm.
 */
export function ProfileScreen() {
  const colors = useThemeColors();
  const bottom = useTabBarSpace();
  const pro = usePro();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void MeController.loadStats();
    }, []),
  );

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([MeController.load(), MeController.loadStats(), ProController.refreshEntitlement()]);
    setRefreshing(false);
  };

  let i = 0;
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenGlow />
      <ScrollView
        // Sekme barı boşluğu ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
        contentContainerStyle={{ paddingBottom: bottom }}
        contentContainerClassName="gap-7 px-4 pt-2"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      >
        <Animated.View entering={enter(i++)} className="h-12 justify-center">
          <Text accessibilityRole="header" className="text-3xl font-extrabold tracking-tight text-foreground">
            {tr.profile.title}
          </Text>
        </Animated.View>
        <Animated.View entering={enter(i++)} className="gap-3">
          <AccountCard />
          {pro ? <ProActiveCard /> : <ProBanner onPress={() => PaywallController.open("profile")} />}
        </Animated.View>
        <Animated.View entering={enter(i++)}>
          <StatsGrid />
        </Animated.View>
        <Animated.View entering={enter(i++)}>
          <LearningSettings />
        </Animated.View>
        <Animated.View entering={enter(i++)}>
          <AppSettings />
        </Animated.View>
        <Animated.View entering={enter(i++)}>
          <SubscriptionSettings />
        </Animated.View>
        <Animated.View entering={enter(i++)}>
          <SupportSettings />
        </Animated.View>
        <Animated.View entering={enter(i++)}>
          <AccountSettings />
        </Animated.View>
        <Animated.View entering={enter(i++)}>
          <ProfileFooter />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

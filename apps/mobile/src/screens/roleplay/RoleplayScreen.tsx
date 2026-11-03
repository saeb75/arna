import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Drama } from "lucide-react-native";
import { atLeastLevel, type CefrLevel, type RoleplayListItem } from "@glotmate/contracts";
import { QuotaBanner } from "../../components/shared/QuotaBanner";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { Skeleton } from "../../components/ui/Skeleton";
import { PaywallController } from "../../controllers/PaywallController";
import { RoleplayController } from "../../controllers/RoleplayController";
import { categoryLook, categoryOrder } from "../../domain/roleplayCategories";
import { useQuota } from "../../hooks/useQuota";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { useRoleplayStore } from "../../stores/useRoleplayStore";
import { useTabBarSpace } from "../../theme/layout";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";
import { RoleplayShelf } from "./RoleplayShelf";

/**
 * ROL YAP sekmesi: "Seviyene uygun" karuseli (kullanıcının seviyesinde
 * oynanan, henüz oynanmamışlar önce), sonra kategori rafları. Tüm senaryolar
 * açık — seviye yalnız sıralar, kilitlemez.
 */
export function RoleplayScreen() {
  const colors = useThemeColors();
  const bottom = useTabBarSpace();
  const { list, error } = useRoleplayStore();
  const level = useMeStore((s) => s.me?.profile?.cefrLevel ?? "A1") as CefrLevel;
  const quota = useQuota();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void RoleplayController.loadList();
    }, []),
  );

  const { forYou, shelves } = useMemo(() => {
    const items = list ?? [];
    // Seviyene uygun: kullanıcının seviyesinde oynanan + önerilen seviyesi ≤ kullanıcı; oynanmamışlar önce
    const fits = items
      .filter((r) => !r.raised && atLeastLevel(level, r.recommendedFrom))
      .sort((a, b) => Number(!!a.lastAttempt) - Number(!!b.lastAttempt))
      .slice(0, 8);
    const byCat = new Map<string, RoleplayListItem[]>();
    for (const r of items) byCat.set(r.category, [...(byCat.get(r.category) ?? []), r]);
    const cats = [...byCat.keys()].sort((a, b) => categoryOrder(a) - categoryOrder(b));
    return { forYou: fits, shelves: cats.map((c) => ({ category: c, items: byCat.get(c)! })) };
  }, [list, level]);

  const open = (slug: string) => router.push(`/roleplay/${slug}`);
  let i = 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenGlow />
      <ScrollView
        // Sekme barı boşluğu ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
        contentContainerStyle={{ paddingBottom: bottom }}
        contentContainerClassName="gap-7 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.brand}
            onRefresh={async () => {
              setRefreshing(true);
              await RoleplayController.loadList();
              setRefreshing(false);
            }}
          />
        }
      >
        <Animated.View entering={enter(i++)} className="gap-1 px-4">
          <Text accessibilityRole="header" className="text-3xl font-extrabold tracking-tight text-foreground">
            {tr.roleplay.title}
          </Text>
          <Text className="text-base text-muted-foreground">{tr.roleplay.subtitle}</Text>
        </Animated.View>

        {quota ? (
          <Animated.View entering={enter(i++)} className="px-4">
            <QuotaBanner
              used={quota.roleplays === 0}
              label={quota.roleplays === 0 ? tr.quota.roleplayUsed : tr.quota.freeLeft(quota.lessons, quota.roleplays)}
              onPro={() => PaywallController.open(quota.roleplays === 0 ? "quota_roleplay" : "home")}
            />
          </Animated.View>
        ) : null}

        {error && !list ? (
          <View className="px-4">
            <LoadFailed onRetry={() => void RoleplayController.loadList()} />
          </View>
        ) : !list ? (
          <View className="gap-3 px-4">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <View className="flex-row gap-3">
              <Skeleton className="h-[188px] w-[288px] rounded-3xl" />
              <Skeleton className="h-[188px] w-16 rounded-3xl" />
            </View>
            <Skeleton className="mt-4 h-6 w-32 rounded-lg" />
            <View className="flex-row gap-3">
              <Skeleton className="h-[150px] w-[200px] rounded-3xl" />
              <Skeleton className="h-[150px] w-32 rounded-3xl" />
            </View>
          </View>
        ) : !list.length ? (
          <View className="px-4">
            <EmptyState icon={<Drama color={colors["muted-foreground"]} size={22} />} title={tr.roleplay.empty} />
          </View>
        ) : (
          <>
            {forYou.length ? (
              <Animated.View entering={enter(i++)}>
                <RoleplayShelf title={tr.roleplay.forYou} subtitle={`${level} · ${tr.levels[level].name}`} items={forYou} large onOpen={open} />
              </Animated.View>
            ) : null}
            {shelves.map((shelf) => (
              <Animated.View key={shelf.category} entering={enter(Math.min(i++, 8))}>
                <RoleplayShelf title={categoryLook(shelf.category).label} items={shelf.items} onOpen={open} />
              </Animated.View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

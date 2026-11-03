import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { BookOpen, Drama, UserRound, type LucideIcon } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { HapticsService } from "../../services/HapticsService";
import { TAB_BAR_HEIGHT, useTabBarBottom } from "../../theme/layout";
import { useThemeColors } from "../../theme/useThemeColors";

const TABS: Record<string, { icon: LucideIcon; label: string }> = {
  lessons: { icon: BookOpen, label: tr.tabs.lessons },
  roleplay: { icon: Drama, label: tr.tabs.roleplay },
  profile: { icon: UserRound, label: tr.tabs.profile },
};

/**
 * İçeriğin ÜSTÜNDE yüzen yuvarlak sekme barı (GlotCast dili) — aktif sekme
 * marka renginde. Sekme ekranları altlarını `useTabBarSpace()` kadar açar.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const colors = useThemeColors();
  const bottom = useTabBarBottom();
  return (
    // Konum ve gölge ÇALIŞMA ZAMANI değerleri (güvenli alan, tema rengi) — gerekçeli inline stil
    <View className="absolute inset-x-3" style={{ bottom }} pointerEvents="box-none">
      <View
        className="flex-row rounded-[28px] border border-border bg-card"
        style={{
          height: TAB_BAR_HEIGHT,
          shadowColor: colors.scrim,
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const color = focused ? colors.brand : colors["muted-foreground"];
          const Icon = tab.icon;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  HapticsService.tap();
                  navigation.navigate(route.name);
                }
              }}
              className="flex-1 items-center justify-center gap-1 active:opacity-70"
            >
              <Icon color={color} size={23} strokeWidth={focused ? 2.4 : 2} />
              <Text className={`text-[11px] font-semibold ${focused ? "text-brand" : "text-muted-foreground"}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

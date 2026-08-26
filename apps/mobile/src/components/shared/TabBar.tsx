import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Glyph = ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Rota adı → sekme görünümü. Üç sekmeye birden hizmet ettiği için `shared/`. */
const TABS: Record<string, { icon: Glyph; label: string }> = {
  lessons: { icon: "human-male-board", label: "Lessons" },
  practice: { icon: "message-processing", label: "Practice" },
  profile: { icon: "account", label: "Profile" },
};

/**
 * Yüzen hap şeklinde alt bar — içeriğin ÜSTÜNDE durur, ekranlar altına
 * boşluk bırakır. Aktif sekme kendi hapını ve birincil rengini alır.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-x-0 items-center"
      // Alt güvenli alan ÇALIŞMA ZAMANI değeri — NativeWind sınıfıyla ifade
      // edilemez; tasarımda bar ev göstergesinin biraz içine giriyor.
      style={{ bottom: Math.max(insets.bottom - 10, 12) }}
    >
      <View className="flex-row items-center rounded-full bg-surface p-1.5">
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              className={`items-center gap-0.5 rounded-full px-6 py-2 ${focused ? "bg-primary/20" : ""}`}
            >
              <MaterialCommunityIcons name={tab.icon} size={22} color={focused ? "#8b5cf6" : "#9ca3af"} />
              <Text className={`text-[11px] font-medium ${focused ? "text-primary" : "text-muted"}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

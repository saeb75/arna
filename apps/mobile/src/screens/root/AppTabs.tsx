import { NativeTabs } from "expo-router/unstable-native-tabs";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * SEKME BARI — NATIVE (13 Kas 2026, kullanıcı kararı; yüzen JS bar emekli). iOS'ta
 * UITabBarController (iOS 26'da sistemin cam barı), Android'de Material 3 alt gezinme.
 * Yerel kod react-native-screens'in içinde, yeni paket yok → OTA ile gider.
 *
 * Ekranlar üst/alt boşluklarını KENDİLERİ verir (güvenli alan + `useTabBarSpace`):
 * otomatik içerik boşluğu kapalı, yoksa iOS ilk kaydırma görünümüne üst boşluğu ikinci
 * kez ekliyor. Kenarda saydamlaşma kapalı: ekranların ilk çocuğu kaydırma görünümü değil
 * (arka plan ışığı, sabit başlık), iOS 18 ve öncesinde bar içerikle karışıyordu.
 */
export function AppTabs() {
  const colors = useThemeColors();
  const trigger = { disableAutomaticContentInsets: true, disableTransparentOnScrollEdge: true } as const;
  return (
    <NativeTabs tintColor={colors.brand} disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="lessons" {...trigger}>
        <NativeTabs.Trigger.Icon sf={{ default: "book", selected: "book.fill" }} md="menu_book" />
        <NativeTabs.Trigger.Label>{tr.tabs.lessons}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="roleplay" {...trigger}>
        <NativeTabs.Trigger.Icon sf={{ default: "theatermasks", selected: "theatermasks.fill" }} md="theater_comedy" />
        <NativeTabs.Trigger.Label>{tr.tabs.roleplay}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notebook" {...trigger}>
        <NativeTabs.Trigger.Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} md="bar_chart" />
        <NativeTabs.Trigger.Label>{tr.tabs.notebook}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" {...trigger}>
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
        <NativeTabs.Trigger.Label>{tr.tabs.profile}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

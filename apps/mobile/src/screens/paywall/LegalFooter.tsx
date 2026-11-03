import { Pressable, Text, View } from "react-native";
import { tr } from "../../i18n/tr";

/** Eylemin altında: Kullanım Koşulları ve Gizlilik Politikası (mağaza şartı). */
export function LegalFooter({ onTerms, onPrivacy }: { onTerms: () => void; onPrivacy: () => void }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      <Pressable accessibilityRole="link" onPress={onTerms} hitSlop={8} className="active:opacity-60">
        <Text className="text-xs font-semibold text-muted-foreground underline">{tr.paywall.terms}</Text>
      </Pressable>
      <Text className="text-[11px] text-muted-foreground">·</Text>
      <Pressable accessibilityRole="link" onPress={onPrivacy} hitSlop={8} className="active:opacity-60">
        <Text className="text-xs font-semibold text-muted-foreground underline">{tr.paywall.privacy}</Text>
      </Pressable>
    </View>
  );
}

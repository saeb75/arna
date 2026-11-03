import { Text, View } from "react-native";
import { tr } from "../../i18n/tr";
import { GradientFill } from "../ui/GradientFill";

/** Marka gradyanında "PRO". VoiceOver'dan gizli (süs). */
export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className={`overflow-hidden rounded-full px-2 py-0.5 ${className}`}>
      <GradientFill />
      <Text className="text-[10px] font-extrabold tracking-wider text-on-brand">{tr.paywall.pro}</Text>
    </View>
  );
}

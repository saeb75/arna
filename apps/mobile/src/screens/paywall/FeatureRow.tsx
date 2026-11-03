import type { ReactNode } from "react";
import { Text, View } from "react-native";

/** Pro'nun verdiği tek şey: tonlu karoda ikon + tek satır. */
export function FeatureRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="size-8 items-center justify-center rounded-xl bg-brand/15">{icon}</View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} className="flex-1 text-[15px] font-medium text-foreground">
        {text}
      </Text>
    </View>
  );
}

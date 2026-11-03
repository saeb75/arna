import { Children, Fragment, type ReactNode } from "react";
import { Text, View } from "react-native";

/** Başlıklı ayar kartı; satırlar arasında ikonların ötesinden başlayan ince çizgi. */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View className="gap-2">
      <Text accessibilityRole="header" className="px-1 text-sm font-semibold text-muted-foreground">
        {title}
      </Text>
      <View className="overflow-hidden rounded-3xl border border-border bg-card">
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View className="ml-16 h-px bg-border" /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

import type { ReactNode } from "react";
import { Text, View } from "react-native";

/** Boş ya da henüz olmayan bir bölüm için ortalanmış mesaj. */
export function EmptyState({ icon, title, body }: { icon?: ReactNode; title: string; body?: string }) {
  return (
    <View className="items-center gap-2 rounded-3xl border border-dashed border-border bg-card px-6 py-10">
      {icon ? <View className="mb-1 size-11 items-center justify-center rounded-full bg-muted">{icon}</View> : null}
      <Text className="text-center text-base font-semibold text-foreground">{title}</Text>
      {body ? <Text className="text-center text-sm text-muted-foreground">{body}</Text> : null}
    </View>
  );
}

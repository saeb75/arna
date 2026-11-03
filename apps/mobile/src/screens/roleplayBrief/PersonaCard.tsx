import { Text, View } from "react-native";
import type { RoleplayPersona } from "@glotmate/contracts";
import { GradientFill } from "../../components/ui/GradientFill";

/** Karşındaki kişi: baş harfli daire, ad, rol ve ruh hâli. */
export function PersonaCard({ persona, label }: { persona: RoleplayPersona; label: string }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-muted-foreground">{label}</Text>
      <View className="flex-row items-center gap-4 rounded-3xl border border-border bg-card p-4">
        <View className="size-14 items-center justify-center overflow-hidden rounded-full">
          <GradientFill />
          <Text className="text-2xl font-extrabold text-on-brand">{persona.name.charAt(0)}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-bold text-foreground">{persona.name}</Text>
          <Text className="text-sm leading-snug text-muted-foreground">{persona.role}</Text>
          {persona.mood ? (
            <View className="mt-1 self-start rounded-full bg-muted px-2.5 py-0.5">
              <Text className="text-xs font-semibold text-muted-foreground">{persona.mood}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

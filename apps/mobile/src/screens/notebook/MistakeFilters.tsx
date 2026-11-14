import { Pressable, ScrollView, Text } from "react-native";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import type { MistakeFilter } from "../../stores/useNotebookStore";

/** Hata türü filtresi — sayılarıyla: Tümü · Gramer · Daha doğal */
export function MistakeFilters({ filter, counts }: { filter: MistakeFilter; counts: { error: number; unnatural: number } }) {
  const options: { value: MistakeFilter; label: string }[] = [
    { value: "all", label: tr.notebook.filterAll(counts.error + counts.unnatural) },
    { value: "error", label: tr.notebook.filterError(counts.error) },
    { value: "unnatural", label: tr.notebook.filterUnnatural(counts.unnatural) },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-1">
      {options.map((o) => {
        const selected = o.value === filter;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => NotebookController.setFilter(o.value)}
            className={`h-9 justify-center rounded-full border px-4 active:opacity-80 ${selected ? "border-primary bg-primary" : "border-border bg-card"}`}
          >
            <Text className={`text-[13px] font-semibold ${selected ? "text-primary-foreground" : "text-muted-foreground"}`}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

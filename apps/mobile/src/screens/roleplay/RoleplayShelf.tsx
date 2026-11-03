import { ScrollView, View } from "react-native";
import type { RoleplayListItem } from "@glotmate/contracts";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { RoleplayCard } from "./RoleplayCard";

/** Başlıklı yatay raf — kart genişliği + 12 boşlukla yapışarak kayar. */
export function RoleplayShelf({
  title,
  subtitle,
  items,
  large = false,
  onOpen,
}: {
  title: string;
  subtitle?: string;
  items: RoleplayListItem[];
  large?: boolean;
  onOpen: (slug: string) => void;
}) {
  return (
    <View className="gap-3">
      <SectionHeader title={title} subtitle={subtitle} className="px-4" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={(large ? 288 : 200) + 12}
        contentContainerClassName="gap-3 px-4 pb-3"
      >
        {items.map((item) => (
          <RoleplayCard key={item.slug} item={item} large={large} onPress={() => onOpen(item.slug)} />
        ))}
      </ScrollView>
    </View>
  );
}

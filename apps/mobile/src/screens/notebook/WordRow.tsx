import { Pressable, Text, View } from "react-native";
import { Square, Volume2, X } from "lucide-react-native";
import type { SavedWord } from "@glotmate/contracts";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/** Kaydedilen kelime: İngilizcesi (dinlenebilir), ana dildeki anlamı, görüldüğü cümle, sil. */
export function WordRow({ item, speaking }: { item: SavedWord; speaking: boolean }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3 rounded-3xl border border-border bg-card py-3.5 pl-3 pr-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${speaking ? tr.notebook.stop : tr.notebook.listen}: ${item.word}`}
        hitSlop={6}
        onPress={() => void NotebookController.speak(item.word)}
        className="size-10 items-center justify-center rounded-full bg-brand/10 active:opacity-70"
      >
        {speaking ? <Square color={colors.brand} size={14} strokeWidth={2.6} /> : <Volume2 color={colors.brand} size={18} strokeWidth={2.2} />}
      </Pressable>
      <View className="flex-1 gap-0.5">
        <Text className="text-[17px] font-bold text-foreground">{item.word}</Text>
        <Text className="text-[15px] leading-5 text-brand">{item.translation}</Text>
        {item.sentence ? (
          <Text numberOfLines={2} className="pt-0.5 text-[13px] leading-[18px] text-muted-foreground">
            {item.sentence}
          </Text>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${tr.notebook.remove}: ${item.word}`}
        hitSlop={8}
        onPress={() => void NotebookController.removeWord(item.word)}
        className="size-9 items-center justify-center rounded-full bg-muted active:opacity-70"
      >
        <X color={colors["muted-foreground"]} size={16} />
      </Pressable>
    </View>
  );
}

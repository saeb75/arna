import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { Bookmark, BookmarkCheck, X } from "lucide-react-native";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useNotebookStore } from "../../stores/useNotebookStore";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * KELİME KARTI — hocanın sözünde dokunulan İngilizce kelimenin ana dildeki anlamı
 * (14 Kas 2026). Rıhtımın hemen üstünde durur, dersi durdurmaz. Yer imi kelimeyi
 * Defter'e kaydeder / çıkarır. Yoksa hiçbir şey çizmez.
 */
export function WordCard() {
  const colors = useThemeColors();
  const word = useNotebookStore((s) => s.word);
  if (!word) return null;
  return (
    <Animated.View
      key={word.word}
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(160)}
      className="mx-4 mb-2 flex-row items-center gap-3 rounded-2xl border border-brand/25 bg-card px-4 py-3 shadow-md shadow-scrim/10"
    >
      <View className="flex-1 gap-0.5">
        <Text className="text-[17px] font-bold text-brand">{word.word}</Text>
        <Text className={`text-[15px] leading-5 ${word.translation ? "text-foreground" : "text-muted-foreground"}`}>
          {word.translation ?? (word.failed ? tr.notebook.wordFailed : tr.notebook.wordLoading)}
        </Text>
        {word.sentenceTranslation ? (
          <Text numberOfLines={3} className="pt-1 text-[13px] leading-[18px] text-muted-foreground">
            {word.sentenceTranslation}
          </Text>
        ) : null}
      </View>
      {word.translation ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={word.saved ? tr.notebook.unsaveWord : tr.notebook.saveWord}
          accessibilityState={{ selected: word.saved }}
          hitSlop={8}
          onPress={() => void NotebookController.toggleSaveWord()}
          className={`size-10 items-center justify-center rounded-full active:opacity-70 ${word.saved ? "bg-brand/15" : "bg-muted"}`}
        >
          {word.saved ? (
            <BookmarkCheck color={colors.brand} size={19} strokeWidth={2.4} />
          ) : (
            <Bookmark color={colors["muted-foreground"]} size={19} strokeWidth={2.2} />
          )}
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tr.common.close}
        hitSlop={8}
        onPress={() => NotebookController.closeWord()}
        className="size-10 items-center justify-center rounded-full bg-muted active:opacity-70"
      >
        <X color={colors["muted-foreground"]} size={18} />
      </Pressable>
    </Animated.View>
  );
}

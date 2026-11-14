import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Bookmark } from "lucide-react-native";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { Skeleton } from "../../components/ui/Skeleton";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useNotebookStore } from "../../stores/useNotebookStore";
import { usePageBottomSpace } from "../../theme/layout";
import { useThemeColors } from "../../theme/useThemeColors";
import { WordRow } from "./WordRow";

/** Kaydedilen kelimeler — en yeni üstte. Yalnız store'dan okur. */
export function WordList() {
  const colors = useThemeColors();
  const bottom = usePageBottomSpace();
  const { words, wordsLoaded, wordsError, speakingText } = useNotebookStore();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await NotebookController.loadWords();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={words}
      keyExtractor={(w) => w.id}
      // Alt güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
      contentContainerStyle={{ paddingBottom: bottom }}
      contentContainerClassName="gap-2.5 px-4"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListEmptyComponent={
        wordsError && !wordsLoaded ? (
          <LoadFailed onRetry={() => void NotebookController.loadWords()} />
        ) : !wordsLoaded ? (
          <View className="gap-2.5">
            <Skeleton className="h-20 rounded-3xl" />
            <Skeleton className="h-20 rounded-3xl" />
            <Skeleton className="h-20 rounded-3xl" />
          </View>
        ) : (
          <EmptyState
            icon={<Bookmark color={colors["muted-foreground"]} size={20} />}
            title={tr.notebook.emptyWordsTitle}
            body={tr.notebook.emptyWordsBody}
          />
        )
      }
      renderItem={({ item }) => <WordRow item={item} speaking={speakingText === item.word} />}
    />
  );
}

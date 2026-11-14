import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { PartyPopper } from "lucide-react-native";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { Skeleton } from "../../components/ui/Skeleton";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useNotebookStore } from "../../stores/useNotebookStore";
import { usePageBottomSpace } from "../../theme/layout";
import { useThemeColors } from "../../theme/useThemeColors";
import { MistakeCard } from "./MistakeCard";
import { MistakeFilters } from "./MistakeFilters";

/**
 * Hatalar listesi — en yeni üstte, sona gelince sonraki sayfa. Filtre üstte
 * (Tümü / Gramer / Daha doğal). Yalnız store'dan okur.
 */
export function MistakeList() {
  const colors = useThemeColors();
  const bottom = usePageBottomSpace();
  const { mistakes, mistakesLoading, mistakesLoaded, mistakesError, mistakeFilter, mistakeCounts, speakingText } = useNotebookStore();
  const [refreshing, setRefreshing] = useState(false);
  const total = mistakeCounts.error + mistakeCounts.unnatural;

  const refresh = async () => {
    setRefreshing(true);
    await NotebookController.loadMistakes();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={mistakes}
      keyExtractor={(m) => m.id}
      // Alt güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
      contentContainerStyle={{ paddingBottom: bottom }}
      contentContainerClassName="gap-3 px-4"
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.4}
      onEndReached={() => void NotebookController.loadMoreMistakes()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListHeaderComponent={total > 0 ? <MistakeFilters filter={mistakeFilter} counts={mistakeCounts} /> : null}
      ListEmptyComponent={
        mistakesError && !mistakesLoaded ? (
          <LoadFailed onRetry={() => void NotebookController.loadMistakes()} />
        ) : !mistakesLoaded ? (
          <View className="gap-3">
            <Skeleton className="h-36 rounded-3xl" />
            <Skeleton className="h-36 rounded-3xl" />
          </View>
        ) : (
          <EmptyState
            icon={<PartyPopper color={colors["muted-foreground"]} size={20} />}
            title={total > 0 ? tr.notebook.emptyFilterTitle : tr.notebook.emptyMistakesTitle}
            body={total > 0 ? undefined : tr.notebook.emptyMistakesBody}
          />
        )
      }
      ListFooterComponent={mistakesLoading && mistakes.length ? <Skeleton className="h-24 rounded-3xl" /> : null}
      renderItem={({ item }) => <MistakeCard item={item} speaking={speakingText === item.corrected} />}
    />
  );
}

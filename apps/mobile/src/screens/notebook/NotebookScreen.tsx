import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Bookmark, SpellCheck } from "lucide-react-native";
import { StatsGrid } from "./StatsGrid";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { MeController } from "../../controllers/MeController";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useNotebookStore } from "../../stores/useNotebookStore";
import { useTabBarSpace } from "../../theme/layout";
import { enter } from "../../theme/motion";
import { useThemeColors } from "../../theme/useThemeColors";
import { NotebookTile } from "./NotebookTile";

/**
 * İLERLEME sekmesi (14 Kas 2026, kullanıcı kararı; rota adı `notebook`): en üstte SERİ
 * alanı (GlotCast kalıbı: seri + en iyi, altında dakika / ders / rol yapma), altında
 * iki büyük alan — Gramer (konuşurken yapılan hatalar) ve
 * Kelimeler (kaydedilenler). Alana dokununca kendi sayfası açılır. Sekmeye her
 * gelişte sayılar tazelenir (ders/rol yapmadan dönünce yeni kayıtlar görünsün).
 */
export function NotebookScreen() {
  const colors = useThemeColors();
  const bottom = useTabBarSpace();
  const { mistakeCounts, mistakesLoaded, words, wordsLoaded } = useNotebookStore();

  useFocusEffect(
    useCallback(() => {
      void MeController.loadStats();
      void NotebookController.loadMistakes();
      void NotebookController.loadWords();
    }, []),
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenGlow />
      {/* Sekme barı boşluğu ÇALIŞMA ZAMANI değeri — gerekçeli inline stil */}
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }} contentContainerClassName="gap-4 px-4 pt-2" showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)} className="h-12 justify-center">
          <Text accessibilityRole="header" className="text-3xl font-extrabold tracking-tight text-foreground">
            {tr.notebook.title}
          </Text>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <StatsGrid />
        </Animated.View>

        <Animated.View entering={enter(2)} className="flex-row gap-3">
          <NotebookTile
            icon={<SpellCheck color={colors["on-image"]} size={24} strokeWidth={2.4} />}
            title={tr.notebook.grammarTitle}
            count={mistakesLoaded ? mistakeCounts.error + mistakeCounts.unnatural : null}
            unit={tr.notebook.grammarUnit}
            tone="bg-info"
            onPress={() => router.push("/notebook/mistakes")}
          />
          <NotebookTile
            icon={<Bookmark color={colors["on-image"]} size={24} strokeWidth={2.4} />}
            title={tr.notebook.wordsTitle}
            count={wordsLoaded ? words.length : null}
            unit={tr.notebook.wordsUnit}
            tone="bg-positive"
            onPress={() => router.push("/notebook/words")}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

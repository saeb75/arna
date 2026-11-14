import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Languages, MicOff, X } from "lucide-react-native";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useNotebookStore } from "../../stores/useNotebookStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { RoundIconButton } from "../ui/RoundIconButton";
import { Skeleton } from "../ui/Skeleton";
import { RunsText } from "./RunsText";

/**
 * İNCELEME SHEET'İ — rozete dokununca açılır: duyduğumuz söz, düzeltilmiş İngilizce
 * cümle ve ana dilde kısa açıklama. Başka dilde söylenen söz hata gibi gösterilmez:
 * yalnız İngilizcesi verilir. "Bunu ben söylemedim" kaydı siler (ses yanlış
 * anlaşılmış olabilir). Alttan yükselen kart — ders arkada sürer, akışa dokunmaz.
 */
export function ReviewSheet() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const id = useNotebookStore((s) => s.openReviewId);
  const entry = useNotebookStore((s) => (s.openReviewId ? s.reviews[s.openReviewId] : undefined));
  const close = () => NotebookController.closeReview();
  const review = entry?.status === "ready" ? entry.review : null;
  const kind = review?.kind;
  const fixable = kind === "error" || kind === "unnatural";

  return (
    <Modal visible={!!id && !!entry} transparent animationType="slide" onRequestClose={close}>
      <Pressable accessibilityLabel={tr.common.close} className="flex-1 bg-scrim/40" onPress={close} />
      {entry ? (
        // Alt güvenli alan ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
        <View className="max-h-[80%] rounded-t-[28px] bg-canvas px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="mb-2 h-1 w-10 self-center rounded-full bg-border" />
          <View className="flex-row items-center justify-between pb-3">
            <Text className="text-xs font-bold tracking-widest text-muted-foreground">{tr.notebook.weHeard.toLocaleUpperCase("tr")}</Text>
            <RoundIconButton variant="muted" icon={<X color={colors.foreground} size={18} />} label={tr.common.close} onPress={close} />
          </View>
          <ScrollView className="grow-0" showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 pb-2">
            <Text className={`text-[19px] leading-7 text-foreground ${fixable ? "text-foreground/70" : "font-semibold"}`}>{entry.text}</Text>

            {entry.status === "pending" ? (
              <View className="gap-2.5">
                <Text className="text-sm text-muted-foreground">{tr.notebook.reviewing}</Text>
                <Skeleton className="h-6 w-4/5 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </View>
            ) : null}

            {entry.status === "failed" ? <Text className="text-sm text-muted-foreground">{tr.notebook.reviewFailed}</Text> : null}

            {kind === "correct" ? (
              <View className="flex-row gap-3 rounded-2xl bg-positive/10 px-4 py-3.5">
                <View className="mt-0.5 size-6 items-center justify-center rounded-full bg-positive">
                  <Check color={colors["on-brand"]} size={14} strokeWidth={3.2} />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-base font-bold text-positive">{tr.notebook.correctTitle}</Text>
                  {review?.runs.length ? (
                    <RunsText runs={review.runs} className="text-[15px] leading-[22px]" />
                  ) : (
                    <Text className="text-[15px] leading-[22px] text-foreground">{tr.notebook.correctBody}</Text>
                  )}
                </View>
              </View>
            ) : null}

            {kind === "other_language" && review ? (
              <View className="gap-2 rounded-2xl border border-border bg-card px-4 py-3.5">
                <View className="flex-row items-center gap-2">
                  <Languages color={colors["muted-foreground"]} size={15} />
                  <Text className="text-xs font-bold tracking-wider text-muted-foreground">{tr.notebook.inEnglish.toLocaleUpperCase("tr")}</Text>
                </View>
                <Text className="text-[19px] font-bold leading-7 text-brand">{review.corrected}</Text>
                {review.runs.length ? <RunsText runs={review.runs} className="text-[15px] leading-[22px] text-muted-foreground" /> : null}
              </View>
            ) : null}

            {fixable && review ? (
              <>
                <View className="gap-1.5 rounded-2xl bg-positive/10 px-4 py-3.5">
                  <Text className="text-xs font-bold tracking-wider text-positive">
                    {(kind === "error" ? tr.notebook.corrected : tr.notebook.moreNatural).toLocaleUpperCase("tr")}
                  </Text>
                  <Text className="text-[19px] font-bold leading-7 text-foreground">{review.corrected}</Text>
                </View>
                {review.runs.length ? <RunsText runs={review.runs} className="text-[15px] leading-[23px] text-muted-foreground" /> : null}
                {id ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityHint={tr.notebook.notMineHint}
                    onPress={() => void NotebookController.notMine(id)}
                    className="flex-row items-center gap-2 self-start rounded-full bg-muted px-3.5 py-2 active:opacity-70"
                  >
                    <MicOff color={colors["muted-foreground"]} size={14} />
                    <Text className="text-[13px] font-semibold text-muted-foreground">{tr.notebook.notMine}</Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </Modal>
  );
}

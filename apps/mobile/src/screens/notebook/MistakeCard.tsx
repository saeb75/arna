import { Pressable, Text, View } from "react-native";
import { BookOpen, CircleAlert, Drama, MicOff, Sparkles, Square, Volume2 } from "lucide-react-native";
import type { MistakeItem } from "@glotmate/contracts";
import { RunsText } from "../../components/shared/RunsText";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Bir hata kaydı: tür çipi, söylenen cümle (soluk), doğrusu (yeşil zeminde, dinlenebilir),
 * ana dilde kısa açıklama, hangi ders/sahnede söylendiği ve "bunu ben söylemedim"
 * (ses yanlış anlaşıldıysa kaydı siler).
 */
export function MistakeCard({ item, speaking }: { item: MistakeItem; speaking: boolean }) {
  const colors = useThemeColors();
  const isError = item.kind === "error";
  const OriginIcon = item.origin.kind === "roleplay" ? Drama : BookOpen;
  return (
    <View className="gap-3 rounded-3xl border border-border bg-card p-4">
      <View className={`flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1 ${isError ? "bg-warning/15" : "bg-info/15"}`}>
        {isError ? <CircleAlert color={colors.warning} size={13} strokeWidth={2.4} /> : <Sparkles color={colors.info} size={13} strokeWidth={2.4} />}
        <Text className={`text-[11px] font-bold ${isError ? "text-warning" : "text-info"}`}>
          {isError ? tr.notebook.kindError : tr.notebook.kindUnnatural}
        </Text>
      </View>

      <Text className="text-[16px] leading-6 text-foreground/60">{item.text}</Text>

      <View className="flex-row items-center gap-3 rounded-2xl bg-positive/10 py-3 pl-4 pr-2.5">
        <Text className="flex-1 text-[17px] font-bold leading-6 text-foreground">{item.corrected}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={speaking ? tr.notebook.stop : tr.notebook.listen}
          hitSlop={6}
          onPress={() => void NotebookController.speak(item.corrected)}
          className="size-10 items-center justify-center rounded-full bg-card active:opacity-70"
        >
          {speaking ? <Square color={colors.positive} size={15} strokeWidth={2.6} /> : <Volume2 color={colors.positive} size={19} strokeWidth={2.2} />}
        </Pressable>
      </View>

      {item.runs.length ? <RunsText runs={item.runs} className="text-[14.5px] leading-[21px] text-muted-foreground" /> : null}

      <View className="flex-row items-center justify-between gap-3 border-t border-border pt-3">
        <View className="flex-1 flex-row items-center gap-1.5">
          {item.origin.title ? (
            <>
              <OriginIcon color={colors["muted-foreground"]} size={13} />
              <Text numberOfLines={1} className="flex-1 text-[12.5px] font-medium text-muted-foreground">
                {item.origin.title}
              </Text>
            </>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityHint={tr.notebook.notMineHint}
          hitSlop={8}
          onPress={() => void NotebookController.dismissMistake(item.id)}
          className="flex-row items-center gap-1.5 active:opacity-60"
        >
          <MicOff color={colors["muted-foreground"]} size={13} />
          <Text className="text-[12.5px] font-semibold text-muted-foreground">{tr.notebook.notMine}</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Check, CircleAlert, Ellipsis, Languages, RotateCw, Sparkles } from "lucide-react-native";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { useNotebookStore } from "../../stores/useNotebookStore";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Öğrenci balonunun yanındaki İNCELEME ROZETİ (14 Kas 2026): yeşil onay = doğru cümle,
 * turuncu ünlem = düzeltme var, yıldız = daha doğal söylenir, dil ikonu = İngilizce
 * söylenmedi (hata DEĞİL — nötr). Dokununca sheet açılır. İnceleme yoksa (kısa onay,
 * eski mesaj) hiçbir şey çizmez. Yalnız gösterim — ders akışı bu sonucu görmez.
 */
export function ReviewBadge({ messageId }: { messageId: string }) {
  const colors = useThemeColors();
  const entry = useNotebookStore((s) => s.reviews[messageId]);
  if (!entry) return null;
  const kind = entry.status === "ready" ? (entry.review?.kind ?? "correct") : entry.status;
  if (kind === "too_short") return null;

  const look = {
    pending: { box: "bg-muted", icon: <Ellipsis color={colors["muted-foreground"]} size={15} strokeWidth={2.4} /> },
    failed: { box: "bg-muted", icon: <RotateCw color={colors["muted-foreground"]} size={14} strokeWidth={2.4} /> },
    correct: { box: "bg-positive/15", icon: <Check color={colors.positive} size={15} strokeWidth={3} /> },
    error: { box: "bg-warning/20", icon: <CircleAlert color={colors.warning} size={16} strokeWidth={2.4} /> },
    unnatural: { box: "bg-info/15", icon: <Sparkles color={colors.info} size={15} strokeWidth={2.4} /> },
    other_language: { box: "bg-muted", icon: <Languages color={colors["muted-foreground"]} size={15} strokeWidth={2.2} /> },
  }[kind];

  return (
    <Animated.View key={kind} entering={FadeIn.duration(220)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tr.notebook.badge[kind]}
        hitSlop={10}
        onPress={() => NotebookController.openReview(messageId)}
        className={`size-8 items-center justify-center rounded-full active:opacity-70 ${look.box}`}
      >
        {look.icon}
      </Pressable>
    </Animated.View>
  );
}

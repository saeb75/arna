import { Text, View } from "react-native";
import { CloudOff } from "lucide-react-native";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";
import { Button } from "./Button";

/** Bir şey yüklenemedi: tek cümlelik sebep + tekrar dene. */
export function LoadFailed({ title, body, onRetry }: { title?: string; body?: string; onRetry: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="items-center gap-3 rounded-3xl border border-dashed border-border bg-card px-6 py-10">
      <View className="size-12 items-center justify-center rounded-full bg-muted">
        <CloudOff color={colors["muted-foreground"]} size={22} />
      </View>
      <Text className="text-center text-base font-semibold text-foreground">{title ?? tr.errors.loadTitle}</Text>
      <Text className="text-center text-sm text-muted-foreground">{body ?? tr.errors.loadBody}</Text>
      <Button label={tr.common.retry} onPress={onRetry} size="sm" className="mt-1" />
    </View>
  );
}

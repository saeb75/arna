import { Text, View } from "react-native";
import { WifiOff } from "lucide-react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { ScreenGlow } from "../../components/ui/ScreenGlow";
import { AuthController } from "../../controllers/AuthController";
import { tr } from "../../i18n/tr";
import { useThemeColors } from "../../theme/useThemeColors";

/** Açılış düştü (ağ yok, oturum açılamadı) — tek eylem: tekrar dene. */
export function BootError() {
  const colors = useThemeColors();
  return (
    <View className="flex-1 justify-center gap-8 bg-canvas px-8">
      <ScreenGlow height={480} />
      <View className="items-center gap-4">
        <View className="size-20 items-center justify-center rounded-full bg-brand/10">
          <WifiOff color={colors.brand} size={34} />
        </View>
        <Text className="text-center text-2xl font-extrabold tracking-tight text-foreground">{tr.errors.bootTitle}</Text>
        <Text className="text-center text-base leading-snug text-muted-foreground">{tr.errors.bootBody}</Text>
      </View>
      <CtaButton label={tr.common.retry} onPress={() => void AuthController.boot()} />
    </View>
  );
}

import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { MailCheck } from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { AuthController } from "../../controllers/AuthController";
import { tr } from "../../i18n/tr";
import { useAuthStore } from "../../stores/useAuthStore";
import { useThemeColors } from "../../theme/useThemeColors";
import { AppleButton } from "./AppleButton";
import { EmailForm } from "./EmailForm";
import { OrDivider } from "./OrDivider";

/**
 * Misafiri KALICI yap — AYNI kullanıcı: ilerleme, Emma'nın hafızası ve satın
 * alma olduğu gibi kalır. E-posta doğrulaması açıksa "e-postanı kontrol et".
 */
export function SaveProgressSheet() {
  const colors = useThemeColors();
  const pending = useAuthStore((s) => s.pendingEmail);
  const busy = useAuthStore((s) => s.busy);

  useEffect(() => AuthController.clearError(), []);

  if (pending) {
    return (
      <View className="flex-1 items-center gap-4 bg-canvas px-6 pt-12">
        <View className="size-20 items-center justify-center rounded-full bg-brand/15">
          <MailCheck color={colors.brand} size={34} />
        </View>
        <Text className="text-center text-2xl font-extrabold tracking-tight text-foreground">{pending}</Text>
        <Text className="text-center text-base leading-snug text-muted-foreground">{tr.auth.checkEmail}</Text>
        <Button label={tr.common.continue} variant="primary" busy={busy} onPress={() => void AuthController.checkVerified()} className="mt-2 w-full" />
      </View>
    );
  }

  return (
    // Kaydırıcı sheet'in TEK ve KÖK çocuğu (formSheet kuralı); klavye payı iOS'ta otomatik
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-4 px-5 pb-10 pt-8"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
        <SheetHeader title={tr.auth.saveTitle} body={tr.auth.saveBody} />
        <AppleButton disabled={busy} onPress={() => void AuthController.linkApple()} />
        <OrDivider />
        <EmailForm cta={tr.auth.create} onSubmit={(email, password) => void AuthController.linkEmail(email, password)} />
    </ScrollView>
  );
}

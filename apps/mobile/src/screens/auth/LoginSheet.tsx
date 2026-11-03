import { useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { AuthController } from "../../controllers/AuthController";
import { tr } from "../../i18n/tr";
import { useAuthStore } from "../../stores/useAuthStore";
import { useMeStore } from "../../stores/useMeStore";
import { AppleButton } from "./AppleButton";
import { EmailForm } from "./EmailForm";
import { OrDivider } from "./OrDivider";

/**
 * MEVCUT hesaba giriş — kimlik değişir. Misafirin ilerlemesi varsa önce uyarılır
 * (o ilerleme yeni hesaba taşınmaz; taşımak için "İlerlemeni kaydet").
 */
export function LoginSheet() {
  const anonymous = useAuthStore((s) => s.isAnonymous);
  const hasProfile = useMeStore((s) => !!s.me?.profile);
  const guestWithProgress = anonymous && hasProfile;

  useEffect(() => AuthController.clearError(), []);

  const confirm = (go: () => void) => {
    if (!guestWithProgress) return go();
    Alert.alert(tr.auth.loseGuestTitle, tr.auth.loseGuestBody, [
      { text: tr.common.cancel, style: "cancel" },
      { text: tr.auth.loseGuestConfirm, style: "destructive", onPress: go },
    ]);
  };

  return (
    // Kaydırıcı sheet'in TEK ve KÖK çocuğu (formSheet kuralı); klavye payı iOS'ta otomatik
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-4 px-5 pb-10 pt-8"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
        <SheetHeader title={tr.auth.loginTitle} body={tr.auth.loginBody} />
        <AppleButton onPress={() => confirm(() => void AuthController.signInApple())} />
        <OrDivider />
        <EmailForm cta={tr.auth.signIn} onSubmit={(email, password) => confirm(() => void AuthController.signInEmail(email, password))} />
    </ScrollView>
  );
}

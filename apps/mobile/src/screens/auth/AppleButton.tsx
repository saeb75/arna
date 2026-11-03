import { useEffect, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { AppleAuthService } from "../../services/AppleAuthService";
import { useScheme } from "../../theme/useScheme";

/** Apple'ın kendi düğmesi (mağaza kuralı: kendi görünümü) — yalnız destekleyen cihazda. */
export function AppleButton({ onPress, disabled = false }: { onPress: () => void; disabled?: boolean }) {
  const scheme = useScheme();
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    void AppleAuthService.available().then(setAvailable);
  }, []);
  if (!available) return null;
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={scheme === "dark" ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={18}
      // Native düğme sınıf almaz — ölçü inline (mağaza yönergesi yüksekliği)
      style={{ height: 54, width: "100%", opacity: disabled ? 0.5 : 1 }}
      onPress={() => !disabled && onPress()}
    />
  );
}

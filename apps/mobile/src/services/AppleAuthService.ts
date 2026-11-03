import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

/**
 * Sign in with Apple — kimlik belirteci (identity token) Supabase'e verilir.
 * Supabase anonim kullanıcıyı bu belirteçle BAĞLAR (`linkIdentity`) ya da
 * mevcut hesaba GİRER (`signInWithIdToken`); burada yalnız Apple tarafı var.
 */
export class AppleAuthService {
  static async available(): Promise<boolean> {
    if (Platform.OS !== "ios") return false;
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch {
      return false;
    }
  }

  /** Belirteç + (varsa, yalnız ilk girişte gelir) ad; kullanıcı vazgeçerse null */
  static async signIn(): Promise<{ token: string; fullName: string | null } | null> {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) return null;
      const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ");
      return { token: credential.identityToken, fullName: name || null };
    } catch (err) {
      if ((err as { code?: string }).code === "ERR_REQUEST_CANCELED") return null;
      throw err;
    }
  }
}

import { Platform } from "react-native";

/**
 * Tanıtım sayfalarının Reanimated layout animasyonları yalnız iOS'ta: Android'de
 * gölge ağacından kare kare geçer, kelimeler kekeleyerek yükselir (GlotCast'te
 * ölçüldü). Orada içerik sayfanın kendi geçişiyle belirir.
 */
export const INTRO_LAYOUT_ANIMATIONS = Platform.OS !== "android";

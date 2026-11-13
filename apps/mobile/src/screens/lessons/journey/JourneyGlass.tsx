import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { useScheme } from "../../../theme/useScheme";

/** iOS 26 Liquid Glass var mı (bazı beta'larda API yoktu — ikisi birden denetlenir); süreç boyunca değişmez */
export const GLASS = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

/**
 * Yolculuk yüzeylerinin (başlık kartı, durak kartları) NATIVE Liquid Glass zemini
 * (14 Kas 2026, kullanıcı isteği): ebeveyni tamamen kaplar, köşe yarıçapını ebeveynle
 * aynı alır. `expo-glass-effect` kurulu derlemede zaten var → OTA ile gider. Cam yoksa
 * (Android, iOS ≤ 18) hiçbir şey çizmez — çağıran dolu kart sınıflarına düşer (`GLASS`).
 */
export function GlassFill({ radius, tint, interactive = false }: { radius: number; tint?: string; interactive?: boolean }) {
  const scheme = useScheme();
  if (!GLASS) return null;
  return (
    <GlassView
      glassEffectStyle="regular"
      isInteractive={interactive}
      colorScheme={scheme}
      tintColor={tint}
      // GlassView NativeWind sınıfı almaz — konum ve köşe style ile
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius }}
    />
  );
}

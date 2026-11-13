/**
 * Ana ekran başlığındaki "süzülen öğretmen" görselleri (13 Kas 2026, yolculuk denemesi).
 * Her 2.5D öğretmenin portresinden Gemini görsel modeliyle üretildi (aynı karakter,
 * kulaklıklı, 3B) ve beyaz arka planı şeffaflaştırıldı; paketlenmiş — OTA ile gider.
 * Görseli olmayan öğretmende null → ekran yuvarlak portreye düşer.
 */
const HERO: Record<string, number> = {
  raven: require("../../assets/avatars/raven/hero.png"),
  kai: require("../../assets/avatars/kai/hero.png"),
  lena: require("../../assets/avatars/lena/hero.png"),
  theo: require("../../assets/avatars/theo/hero.png"),
};

export function tutorHero(avatarId: string): number | null {
  return HERO[avatarId] ?? null;
}

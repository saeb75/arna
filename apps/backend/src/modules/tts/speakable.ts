/**
 * TTS'E GİDEN METNİN SESLENDİRİLEBİLİR HÂLİ — ekranda görünen metin DEĞİŞMEZ,
 * yalnız sağlayıcıya giden kopya. Sağlayıcıdan bağımsızdır, dile değil işarete bakar.
 *
 * Neden (4 Kas 2026 dil sondası, `scripts/tts-lang-probe.ts`): cümle kurma görevinin
 * ipucu kelimeleri "hello / my name is / Ana" sesli okunurken "hello SLASH my name is
 * SLASH Ana" (Azure) ya da "hello OR my name is" (Inworld) çıkıyordu; boşluk işareti
 * "___" Inworld'de "underscore" diye okunuyordu. İkisi de konuşmada DURAKTIR.
 */
export function speakableText(text: string): string {
  return (
    text
      // Boşluk işareti ("My brother ___ a doctor.") → kısa durak
      .replace(/_{2,}/g, "…")
      // Kelime ayracı: boşluklu eğik çizgi ya da iki harf arasındaki ("he/she") → virgül durağı.
      // Rakamlar arasındaki (1/2, 9/11) okunuşu sağlayıcıya bırakılır.
      .replace(/\s+\/\s+|(?<=\p{L})\/(?=\p{L})/gu, ", ")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

/**
 * Dil etiketli parçaları TEK konuşma metnine birleştirir (tam cümle okuyan sağlayıcı).
 * Kapanış noktalaması ve kesmeyle başlayan ek öncekine YAPIŞIR ("are" + "'ı" → "are'ı",
 * "about" + ". Are" → "about. Are"); açılış işaretinden sonra boşluk girmez.
 * İstemcinin `RunsText.needsSpace` kuralıyla aynı.
 */
export function joinForSpeech(texts: string[]): string {
  let out = "";
  for (const raw of texts) {
    const t = raw.trim();
    if (!t) continue;
    if (out && !/[(\[{¿¡«“]$/.test(out) && !/^[.,!?;:…)\]}'’»”%]/.test(t)) out += " ";
    out += t;
  }
  return out;
}

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
  const core = text
    // Boşluk işareti ("My brother ___ a doctor.") → kısa durak
    .replace(/_{2,}/g, "…")
    // Kelime ayracı: boşluklu eğik çizgi ya da iki harf arasındaki ("he/she") → virgül durağı.
    // Rakamlar arasındaki (1/2, 9/11) okunuşu sağlayıcıya bırakılır.
    .replace(/\s+\/\s+|(?<=\p{L})\/(?=\p{L})/gu, ", ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  if (!core) return "";
  // Parça sınırındaki SATIR ARASI korunur (yönerge "…doldur:\n\n" + İngilizce madde, şıklar
  // "\nA) …"): `joinForSpeech` onu paragraf arasına çevirir → model dil değişiminde durur.
  return `${/^\s*\n/.test(text) ? "\n" : ""}${core}${/\n\s*$/.test(text) ? "\n" : ""}`;
}

/**
 * Dil etiketli parçaları TEK konuşma metnine birleştirir (tam cümle okuyan sağlayıcı).
 * Kapanış noktalaması ve kesmeyle başlayan ek öncekine YAPIŞIR ("are" + "'ı" → "are'ı",
 * "about" + ". Are" → "about. Are"); açılış işaretinden sonra boşluk girmez.
 * İstemcinin `RunsText.needsSpace` kuralıyla aynı.
 */
export function joinForSpeech(texts: string[]): string {
  let out = "";
  let pendingBreak = false;
  for (const raw of texts) {
    const breakBefore: boolean = pendingBreak || /^\s*\n/.test(raw);
    pendingBreak = /\n\s*$/.test(raw);
    const t = raw.trim();
    if (!t) {
      pendingBreak ||= breakBefore;
      continue;
    }
    // Satır arası → paragraf arası (5 Kas 2026): yönerge ile İngilizce madde bitişik
    // okunduğunda Gemini dil geçişinde aksan kaydırıyordu; paragraf arasında durup temiz geçiyor.
    if (out && breakBefore) out += "\n\n";
    else if (out && !/[(\[{¿¡«“]$/.test(out) && !/^[.,!?;:…)\]}'’»”%]/.test(t)) out += " ";
    out += t;
  }
  return out;
}

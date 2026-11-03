/**
 * Ana dilin ARAYÜZ dilindeki adı ("tr" → "Türkçe"). Kök kural: dil adı
 * sabitlenmez, `Intl.DisplayNames` ile çözülür. Hermes'te bu API YOK (ölçüldü:
 * simülatörde "TR" göründü) → null döner ve metin genel ifadeye düşer
 * ("Kendi dilimde…") — dil tablosu yazılmaz.
 */
export const DEFAULT_NATIVE_LANGUAGE = "tr";
const UI_LOCALE = "tr";

export function languageName(code: string): string | null {
  try {
    if (typeof Intl.DisplayNames !== "function") return null;
    const dn = new Intl.DisplayNames([UI_LOCALE], { type: "language" });
    const name = dn.of(code);
    if (name && name.toLowerCase() !== code.toLowerCase()) {
      return name.charAt(0).toLocaleUpperCase(UI_LOCALE) + name.slice(1);
    }
  } catch {
    // Intl.DisplayNames yok
  }
  return null;
}

/** Cihazın IANA saat dilimi — günlük kota ve seri bu güne göre sayılır */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Ana dil yardımcıları.
 *
 * ÜRÜN İLKESİ: Backend hiçbir yerde belirli bir ana dile göre yazılmaz.
 * Hedef dil (İngilizce) sabittir; ana dil kullanıcı profilinden gelir ve
 * prompt'lara parametre olarak geçer. Uygulama 100'lerce ana dile hizmet edecek.
 */

const DEFAULT_LANGUAGE = "tr";

let displayNames: Intl.DisplayNames | null = null;
try {
  displayNames = new Intl.DisplayNames(["en"], { type: "language" });
} catch {
  displayNames = null; // ICU verisi yoksa kodun kendisine düşeriz
}

/**
 * BCP-47 kodunu İngilizce dil adına çevirir: "tr" → "Turkish", "es" → "Spanish".
 * Bilinmeyen/boş kodda kodun kendisi döner (prompt yine de anlamlı kalır).
 */
export function languageName(code: string | null | undefined): string {
  const tag = (code ?? DEFAULT_LANGUAGE).trim() || DEFAULT_LANGUAGE;
  try {
    return displayNames?.of(tag) ?? tag;
  } catch {
    return tag;
  }
}

/** Profilde ana dil yoksa güvenli varsayılan. */
export function nativeLanguageOf(profile: { nativeLanguage?: string | null } | null | undefined): string {
  return profile?.nativeLanguage?.trim() || DEFAULT_LANGUAGE;
}

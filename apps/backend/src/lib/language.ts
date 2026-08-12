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

/**
 * BCP-47 etiketini önbellek anahtarı olarak kullanılabilir tek biçime indirger:
 * birincil alt etiket, küçük harf. "tr-TR" / "TR" / "tr" → "tr".
 *
 * Paylaşımlı ders içeriği ana dile göre anahtarlanıyor; normalize edilmezse aynı
 * dilin farklı yazımları ayrı ayrı üretim tetikler ve hem önbelleği hem faturayı
 * katlar. Hem OKUMADA hem YAZMADA uygulanmalı.
 */
export function normalizeNativeLanguage(code: string | null | undefined): string {
  const tag = (code ?? "").trim().toLowerCase();
  const primary = tag.split(/[-_]/)[0];
  return primary && /^[a-z]{2,3}$/.test(primary) ? primary : DEFAULT_LANGUAGE;
}

/** Profilde ana dil yoksa güvenli varsayılan; sonuç daima normalize edilmiştir. */
export function nativeLanguageOf(profile: { nativeLanguage?: string | null } | null | undefined): string {
  return normalizeNativeLanguage(profile?.nativeLanguage);
}

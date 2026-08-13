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
 * Yazı sistemi/bölge farkı GERÇEK dil farkı olan etiketler: zh-Hans ile zh-Hant
 * ayrı yazı sistemleridir, pt-BR ile pt-PT ayrı anlatım gelenekleridir. Bunları
 * "zh"/"pt"e indirgemek iki ayrı okur kitlesine tek içerik servis etmek olur.
 */
const SIGNIFICANT_SUBTAGS: Record<string, ReadonlySet<string>> = {
  zh: new Set(["hans", "hant", "cn", "tw", "hk"]),
  pt: new Set(["br", "pt"]),
  sr: new Set(["latn", "cyrl"]),
};
/** Bölge → kanonik alt etiket (zh-CN aslında Hans, zh-TW/HK aslında Hant demek) */
const SUBTAG_CANON: Record<string, string> = { cn: "hans", tw: "hant", hk: "hant" };

/**
 * BCP-47 etiketini önbellek anahtarı olarak kullanılabilir tek biçime indirger.
 * "tr-TR" / "TR" → "tr"; ama "zh-Hans" → "zh-hans" (KORUNUR, bkz. yukarısı).
 *
 * Paylaşımlı içerik dile göre anahtarlanıyor; normalize edilmezse aynı dilin
 * farklı yazımları ayrı üretim tetikler. Hem OKUMADA hem YAZMADA uygulanmalı.
 */
export function normalizeNativeLanguage(code: string | null | undefined): string {
  const parts = (code ?? "").trim().toLowerCase().split(/[-_]/);
  const primary = parts[0];
  if (!primary || !/^[a-z]{2,3}$/.test(primary)) return DEFAULT_LANGUAGE;

  const significant = SIGNIFICANT_SUBTAGS[primary];
  if (significant) {
    const sub = parts.slice(1).find((p) => significant.has(p));
    if (sub) return `${primary}-${SUBTAG_CANON[sub] ?? sub}`;
  }
  return primary;
}

/** Profilde ana dil yoksa güvenli varsayılan; sonuç daima normalize edilmiştir. */
export function nativeLanguageOf(profile: { nativeLanguage?: string | null } | null | undefined): string {
  return normalizeNativeLanguage(profile?.nativeLanguage);
}

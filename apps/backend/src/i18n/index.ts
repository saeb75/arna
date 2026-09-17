import { chromeBundleSchema, type ChromeBundle } from "@glotmate/contracts";
import { EN_CHROME } from "./en.js";
import { ES_CHROME } from "./es.js";
import { TR_CHROME } from "./tr.js";

/**
 * Chrome kayıt defteri. Yeni dil eklemek = bir dosya + bir satır.
 * Paketler modül yüklenirken BİR KEZ doğrulanır — bozuk paket boot'ta patlar,
 * kullanıcının karşısında değil.
 */
const BUNDLES: Record<string, ChromeBundle> = Object.fromEntries(
  [EN_CHROME, TR_CHROME, ES_CHROME].map((b) => [b.language, chromeBundleSchema.parse(b)]),
);

/** İngilizce'ye düşüşleri saymak için — sessiz dil kaybı üründür hatasıdır. */
let fallbackCount = 0;
export function chromeFallbackCount(): number {
  return fallbackCount;
}

/**
 * Dile göre chrome paketi. Paket yoksa İngilizce'ye düşer ve LOGLAR —
 * native tutor sözü verilmiş bir dilde bunun sık görünmesi, o dilin
 * chrome'unun yazılması gerektiğinin sinyalidir.
 */
export function getChrome(language: string): ChromeBundle {
  const bundle = BUNDLES[language];
  if (bundle) return bundle;
  fallbackCount++;
  console.warn(`[i18n] "${language}" için chrome paketi yok — İngilizce'ye düşüldü (${fallbackCount}. kez)`);
  return BUNDLES.en!;
}

export function hasChrome(language: string): boolean {
  return language in BUNDLES;
}

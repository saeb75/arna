/**
 * El yapımı grafik yardımcıları — saf, React'sız; `scripts/test-chart.ts` ile sınanır.
 * Panel grafik kütüphanesi taşımaz: tek seri çubuk grafik CSS ile çizilir, ölçek burada.
 */

/**
 * Eksen tavanı: değerin üstündeki ilk "yuvarlak" sayı (1·2·2.5·5·10 × 10ⁿ).
 * Çubuklar tavana göre orantılanır; ızgara çizgileri tavanın yarısı ve tamamı.
 * 0 ya da negatif → 0 (boş aralık; grafik çizilmez, boş durum gösterilir).
 */
export function niceCeil(value: number): number {
  if (!(value > 0) || !Number.isFinite(value)) return 0;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * base;
    // Kayan nokta artığı (0.30000000000000004) tavanı bir basamak kaydırmasın
    if (candidate >= value - base * 1e-9) return Number(candidate.toPrecision(12));
  }
  return 10 * base;
}

/** Çubuk yüksekliği yüzdesi; sıfır olmayan değer en az 1.5% görünür (ince ama var) */
export function barPercent(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(1.5, Math.min(100, (value / max) * 100));
}

/** Eksen altı etiketleri: ilk, orta, son indeks (tekrarsız) */
export function axisTicks(length: number): number[] {
  if (length <= 0) return [];
  return [...new Set([0, Math.floor((length - 1) / 2), length - 1])];
}

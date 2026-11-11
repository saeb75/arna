/**
 * Oyun bloğunun SUNUMSAL karıştırması (kartlar, eşleştirmenin sağ sütunu).
 * Puanlamaya girmez — değerlendirme metin/kimlik üzerinden yapılır. Karışık dizi
 * özgün sırayla aynı çıkarsa madde anlamsızlaşır; o yüzden farklı olana dek dener.
 */
export function shuffledOrder(n: number): number[] {
  const base = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return base;
  for (let attempt = 0; attempt < 8; attempt++) {
    const a = [...base];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    if (a.some((v, i) => v !== i)) return a;
  }
  return [...base].reverse();
}
